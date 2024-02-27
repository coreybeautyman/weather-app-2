let weather = {
  apiKey: 'b2f1577af464ec99fa64d3f444da5a4f',

  fetchWeather: function (city) {
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${this.apiKey}`
    )
      .then(responce => responce.json())
      .then(data => this.displayWeather(data));
  },

  fetchCities: function (prefix) {
    return fetch(`https://api.teleport.org/api/cities/?search=${prefix}`).then(
      response => response.json()
    );
  },

  updateDropdown: function (cities) {
    const dropdown = document.querySelector('.dropdown');
    dropdown.innerHTML = '';
    cities.forEach(city => {
      const option = document.createElement('div');
      option.className = 'option';
      option.innerText = city;
      option.addEventListener('click', () => this.selectCity(city));
      dropdown.appendChild(option);
    });

    dropdown.style.display = cities.length > 0 ? 'block' : 'none';
  },

  selectCity: function (city) {
    document.querySelector('.search-bar').value = city;
    this.fetchWeather(city);
    document.querySelector('.dropdown').style.display = 'none';
  },

  displayWeather: function (data) {

    let { name, timezone } = data;
    const { icon, description } = data.weather[0];
    const { temp, humidity } = data.main;
    const { speed } = data.wind;
    let { sunrise, sunset } = data.sys;


    const timeFormat = {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    };

    sunrise = new Date((sunrise + timezone) * 1000);
    sunset = new Date((sunset + timezone) * 1000);

    let sunriseLocalisedTime = sunrise.toLocaleTimeString('en-GB', timeFormat);
    const sunsetLocalisedTime = sunset.toLocaleTimeString('en-GB', timeFormat);

    document.querySelector('.city').innerText = `${name}`;
    document.querySelector(
      '.icon'
    ).src = `https://openweathermap.org/img/wn/${icon}.png`;
    document.querySelector('.temp').innerText = `${Math.floor(temp)}°C`;
    document.querySelector('.description').innerText = `${description}`;
    document.querySelector('.humidity').innerText = `Humidity: ${humidity}%`;
    document.querySelector('.wind').innerText = `Wind Speed: ${Math.round(
      speed * 2.237
    )}mph`;
    document.querySelector(
      '.sunrise'
    ).innerText = `Sunrise: ${sunriseLocalisedTime}`;
    document.querySelector(
      '.sunset'
    ).innerText = `Sunset: ${sunsetLocalisedTime}`;
    document.querySelector('.weather').classList.remove('loading');
    document.querySelector('.weather').classList.remove('blur');
    document.body.style.backgroundImage = `url('https://source.unsplash.com/1600x900/?${name}')`;
  },

  search: function () {
    this.fetchWeather(document.querySelector('.search-bar').value);
  },
};

document.querySelector('.search button').addEventListener('click', function () {
  weather.search();
});

document
  .querySelector('.search-bar')
  .addEventListener('keyup', function (event) {
    if (event.key == 'Enter') {
      weather.search();
    }
  });

document
  .querySelector('.search-bar')
  .addEventListener('input', async function () {
    const searchValue = this.value.trim();
    if (searchValue === '') {
      document.querySelector('.dropdown').style.display = 'none';
      document.querySelector('.weather').classList.remove('blur');
      return;
    }

    try {
      document.querySelector('.weather').classList.add('blur');
      document.querySelector('.weather').classList.add('pointer');

      const citiesData = await weather.fetchCities(searchValue);

      const cities = citiesData._embedded['city:search-results']
        .filter(
          result =>
            result.matching_full_name &&
            result.matching_full_name.includes(',') &&
            !result.matching_full_name.includes('(')
        )
        .map(result => {
          const placeParts = result.matching_full_name.split(',');
          const city = placeParts[0].trim();
          const country = placeParts[2].trim();
          return `${city}, ${country}`;
        });

      weather.updateDropdown(cities);
    } catch (error) {
      console.log('Error fetching cities', error);
    }
  });
weather.fetchWeather('london');

