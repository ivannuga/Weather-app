import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-weather',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './weather.component.html',
  styleUrl: './weather.component.css',
})
export class WeatherComponent {
  cityControl = signal('');
  cities: any[] = [];
  weatherResults: any[] = [];
  favoriteCities = signal<any[]>([]);

  apiKey = ''; //openweatherKey

  constructor(private http: HttpClient) {
    this.loadFavorites();
  }

  updateCity(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.cityControl.set(inputElement.value);
  }

  searchCities(query: string) {
    if (!query.trim()) {
      this.cities = [];
      return;
    }

    const apiKeyCity = ''; //API Ninjas key

    fetch(`https://api.api-ninjas.com/v1/city?name=${query}`, {
      headers: { 'X-Api-Key': apiKeyCity },
    })
      .then((response) => response.json())
      .then((data) => {
        this.cities = data || [];
        console.log('Cities found:', this.cities);

        if (this.cities.length > 0) {
          this.getWeatherForCities();
        }
      })
      .catch((error) => console.error('Error fetching cities:', error));
  }

  getWeatherForCities() {
    this.weatherResults = [];

    this.cities.forEach((city) => {
      if (city.name) {
        const cityName = city.name;
        this.fetchWeather(cityName);
      } else {
        console.error('City name is missing', city);
      }
    });
  }

  fetchWeather(city: string) {
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${this.apiKey}&units=metric`,
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.cod === 200) {
          this.weatherResults.push(data);
          console.log('weather data fetched for:', city, data);
        } else {
          console.error('Error fetching weather for:', city, data);
        }
      })
      .catch((error) =>
        console.error(`Error fetching weather for ${city}:`, error),
      );
  }

  removeFromFavorites(city: any) {
    this.favoriteCities.set(
      this.favoriteCities().filter((fav) => fav.name !== city.name),
    );
    this.saveFavorites();
  }

  saveFavorites() {
    if (typeof window !== 'undefined') {
      const favoritesWithWeather = this.favoriteCities().map((fav) => ({
        ...fav,
        weather: fav.weather ? { ...fav.weather } : null,
      }));
      localStorage.setItem(
        'favoriteCities',
        JSON.stringify(favoritesWithWeather),
      );
    }
  }

  loadFavorites() {
    if (typeof window !== 'undefined') {
      const savedFavorites = localStorage.getItem('favoriteCities');
      if (savedFavorites) {
        try {
          const parsedFavorites = JSON.parse(savedFavorites);
          if (Array.isArray(parsedFavorites)) {
            this.favoriteCities.set(parsedFavorites);
            this.favoriteCities().forEach((city) => {
              if (!city.weather) {
                this.fetchWeatherForFavorite(city);
              }
            });
          } else {
            console.warn('Invalid data in localStorage. Resetting favorites.');
            localStorage.removeItem('favoriteCities');
            this.favoriteCities.set([]);
          }
        } catch (error) {
          console.error(
            'Error parsing favoriteCities from localStorage:',
            error,
          );
          localStorage.removeItem('favoriteCities');
          this.favoriteCities.set([]);
        }
      }
    }
  }

  fetchWeatherForFavorite(city: any) {
    if (city.name) return;

    fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city.name}&appid=${this.apiKey}&units=metric`,
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.cod === 200) {
          this.favoriteCities.set(
            this.favoriteCities().map((fav) =>
              fav.name === city.name ? { ...fav, weather: data } : fav,
            ),
          );

          this.saveFavorites();
        }
      })
      .catch((error) =>
        console.error(`Error fetching weather for ${city.name}:`, error),
      );
  }

  toggleFavorite(city: any) {
    const existingCity = this.favoriteCities().find(
      (fav) => fav.name === city.name,
    );

    if (existingCity) {
      this.favoriteCities.set(
        this.favoriteCities().filter((fav) => fav.name !== city.name),
      );
    } else {
      const newFavorite = { ...city, weather: null };
      this.favoriteCities.set([...this.favoriteCities(), newFavorite]);
      this.fetchWeatherForFavorite(newFavorite);
    }
    this.saveFavorites();
  }

  isFavorite(city: any): boolean {
    return this.favoriteCities().some((fav) => fav.name === city.name);
  }

  //Code to show 24 hour weather.
  fetchHourlyForecast(city: any) {
    if (!city.name) return;

    console.log(`Fetching hourly forecast for: ${city.name}`);

    fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city.name}&appid=${this.apiKey}&units=metric`,
    )
      .then((response) => response.json())
      .then((data) => {
        console.log('API Response:', data);

        if (data.cod === '200') {
          const hourlyData = data.list.slice(0, 8).map((entry: any) => ({
            time: new Date(entry.dt * 1000).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
            temp: entry.main.temp,
          }));

          console.log(`Hourly forecast for ${city.name}:`, hourlyData);

          this.favoriteCities.set(
            this.favoriteCities().map((fav) =>
              fav.name === city.name
                ? { ...fav, hourlyForecast: hourlyData }
                : fav,
            ),
          );
        } else {
          console.error(
            `Error: API response code ${data.cod} - ${data.message}`,
          );
        }
      })
      .catch((error) =>
        console.error(
          `Error fetching hourly forecast for ${city.name}:`,
          error,
        ),
      );
  }

  //code to show the 7 day forecast
  fetchWeeklyForecast(city: any) {
    if (!city.name || !city.coord) return;

    fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${city.coord.lat}&lon=${city.coord.lon}&exclude=hourly,minutely,current&appid=${this.apiKey}&units=metric`,
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.daily) {
          const weeklyData = data.daily.slice(0, 7).map((entry: any) => ({
            date: new Date(entry.dt * 1000).toLocaleDateString(),
            tempMin: entry.temp.min,
            tempMax: entry.temp.max,
          }));

          this.favoriteCities.set(
            this.favoriteCities().map((fav) =>
              fav.name === city.name
                ? { ...fav, weeklyForecast: weeklyData }
                : fav,
            ),
          );
        } else {
          console.error(
            `Error fetching weekly forecast for ${city.name}: Invalid data format`,
            data,
          );
        }
      })
      .catch((error) =>
        console.error(
          `Error fetching weekly forecast for ${city.name}:`,
          error,
        ),
      );
  }

  selectedCity = signal<any | null>(null);

  selectCity(city: any) {
    console.log(`Clicked on: ${city.name}`);

    this.favoriteCities.set(
      this.favoriteCities().map((fav) => {
        if (fav.name === city.name) {
          console.log(
            `Toggling selection for: ${fav.name} (Currently: ${fav.isSelected})`,
          );

          return {
            ...fav,
            isSelected: !fav.isSelected,
            hourlyForecast: fav.hourlyForecast || [],
          };
        }
        return { ...fav, isSelected: false }; // Ensure only one city is selected
      }),
    );

    if (!city.hourlyForecast || city.hourlyForecast.length === 0) {
      console.log(`Fetching forecast for ${city.name}...`);
      this.fetchHourlyForecast(city);
    }
  }
}
