'use strict';

// prettier-ignore
// const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

// let map, mapEvent;
class Workout{
    date = new Date();
    id = (Date.now
        () + '').slice(-10);
    clicks = 0;

    constructor(coords, distance, durations){


        this.coords = coords;
        this.distance = distance; //km
        this.durations = durations; //min
        // _setDescription()
    }
    _setDescription(){
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on   ${this.date.getDate()}`;
        // ${months[this.data.getMonth()]} 10:51
    }
    click(){
        this.clicks++;
    }
} 

class Running extends Workout{
    type = 'running';
    constructor(coords, distance, duration, cadence){
        super(coords, distance, duration, cadence);
        this.cadence = cadence;
        this.calcPace();
        this._setDescription();
    }
    calcPace(){
        this.pace = this.duration / this.distance;
        return this.pace;
    }
}

class Cycling extends Workout
{
    type = 'cycling';
    constructor(coords, distance, duration, ElevationGain){
        super(coords, distance, duration, ElevationGain);
        this.ElevationGain = ElevationGain;
        this.calcSpeed();
        this._setDescription();
    }
    calcSpeed(){
        this.speed = this.distance / (this.duration/60);
        return this.speed;
    }
}

///////////////////////////////////////////////////
// APPLICATION ARCHITECTURE
class App {
  #map;
  #mapZoomLevel =13;
  #mapEvent;
  #workouts =[];

  constructor() {
//    get user's position
    this._getPositon();

    // get data from local storage
    this._getLocalStorage();

    // this._getPositon();
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField);
    containerWorkouts.addEventListener('click', this._moveToPopUp.bind(this));
  }

  _getPositon() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('could not get Your position');
        }
      );
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    console.log(`https://www.google.pt/maps/@${latitude}${longitude}`);

    const coords = [latitude, longitude];
    this.map = L.map('map').setView(coords, this.#mapZoomLevel);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    this.map.on('click', this._showForm.bind(this));
    this.#workouts.forEach(work => {
        this._renderWorkoutMarker(work);
    })
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _hideForm(){
// Empty input
    inputDistance.value =
    inputDuration.value =
    inputCadence.value =
    inputElevation.value =
      '';
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'),1000);
  }

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    const validInputs = (...inputs) => inputs.every(inp => Number.isFinite(inp)); //array
      const allPositive = (...inputs) => inputs.every(inp => inp >0);
    e.preventDefault();

    // get data from form
const type = inputType.value;
const distance = +inputDistance.value;
const duration = +inputDuration.value;
const { lat, lng } = this.#mapEvent.latlng;
let workout;

if(type === 'running'){
    const cadence = +inputCadence.value;

    if(
        // !Number.isFinite(distance) ||
        // !Number.isFinite(distance) ||
        // !Number.isFinite(distance) 
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence) 
    ) 
    return alert('input has to be positive numbers');
  workout = new Running([lat, lng], distance, duration, cadence);
    
}

if(type === 'cycling'){
    const elevation = +inputElevation.value;

    if(
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration) 
    ) 
    return alert('input has to be positive numbers');
    workout = new Cycling([lat, lng], distance, duration, elevation);
}
this.#workouts.push(workout);
console.log(workout);
    // check if data is valid

    // if workout runing create

// Render workout on map as marker
this._renderWorkoutMarker(workout);

// render workout on list
this._renderWorkout(workout);
// hide form plus clear input field
   
this._hideForm();

// set local storage
this._setLocalStorage();
  }
  _renderWorkoutMarker(workout){
    L.marker(workout.coords)
    .addTo(this.map)
    .bindPopup(
      L.popup({
        maxWidth: 250,
        minWidth: 100,
        autoClose: false,
        closeOnClick: false,
        className: `${workout.
            type}-popup`,
      })
    )
    .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : 'walk'} ${workout.description}`
        )
    .openPopup();
  }

  _renderWorkout(workout){

    let html = `
    <li class="workout workout--${workout.type}" data-id="${workout.id}">
        <h2 class="workout__title">${workout.description}</h2>
    <div class="workout__details">
        <span class="workout__icon">${workout.type === 'running' ? '🏃‍♂️' : 'walk'}</span>
        <span class="workout__value">${workout.distance}</span>
        <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
        <span class="workout__icon">⏱</span>
        <span class="workout__value">${workout.duration}</span>
        <span class="workout__unit">min</span>
    </div>
    `;
    if(workout.type === 'Running')
        html += `
        <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${workout.pace.toFixed(1)}</span>
        <span class="workout__unit">min/km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">🦶🏼</span>
        <span class="workout__value">${workout.cadence}</span>
        <span class="workout__unit">spm</span>
      </div>
    </li>
        `;
        if (workout.type === 'cycling')
        html += `
        <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${workout.speed}</span>
        <span class="workout__unit">km/h</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⛰</span>
        <span class="workout__value">${workout.ElevationGain}</span>
        <span class="workout__unit">m</span>
      </div>
    </li>
        `;
        form.insertAdjacentHTML('afterend', html);
    }

    _moveToPopUp(e){
        const workoutEl = e.target.closest('.workout');
        console.log(workoutEl);

        if(!workoutEl) return;

        const workout = this.#workouts.find(
            work => work.id === workoutEl.dataset.id
       );
            console.log(workout);
            this.map.setView(workout.coords, this.#mapZoomLevel,{
                animate: true,
                pan: {
                    duration:1,
                },
            });

            // workout.click();
    }
        _setLocalStorage(){
            localStorage.setItem('workouts', JSON.stringify(this.#workouts) );
        }
        _getLocalStorage(){
            const data = JSON.parse(localStorage.getItem('workouts'));
            console.log(data);

            if(!data) return;

            this.#workouts = data;
            this.#workouts.forEach(work => {
            this._renderWorkout(work);
            
            });
        }

        reset(){
            localStorage.removeItem('workouts');
            location.reload();
        }
  }

const app = new App();
// app._getPosition();
