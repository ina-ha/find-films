
// The Movie Database API key and base url
const key = 'c8dfca264756c42d5c2fc70dd168fba9';
const baseUrl = 'https://api.themoviedb.org/3';

// Selecting DOM elements
const container = document.getElementById('films');
const checkbox = document.getElementById('top-rated');
const show = document.getElementById('filters');
const hide = document.getElementById('hide-filters');
const filterOptions = document.getElementById('filter-options');

let filters = false; // No filters are displayed at first

// Fetch lists from the database. This will be used to fetch the lists of genres, languages, countries etc.
const fetchList = async (endpoint) => {
    const url = baseUrl + endpoint + `?api_key=${key}`;
    try {
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            return data
        }
    }
    catch (error) { console.log(error) }
}


// Create a dropdown list of available genres
const addGenres = async () => {
    const select = document.getElementById('genres');
    const endpoint = '/genre/movie/list';
    const data = await fetchList(endpoint);
    const genres = data.genres;
    for (const genre of genres) {
        const node = document.createElement('option');
        node.innerHTML = genre.name;
        node.value = genre.id;
        select.appendChild(node);
         }
}

// Read user input. This will be used to select genre, year, language and other options

const select = (inputfield) => {
    const result = document.getElementById(`${inputfield}`).value
    return result;
}


// Create endpoint when "top rated" checkbox is selected
const addRating = () => {
    if (checkbox.checked) {
        checkbox.setAttribute('value', '&vote_average.gte=8')
    }
    else checkbox.setAttribute('value', '')

}

// Fetch films from the database
const fetchFilms = async () => {
    const genre = select('genres'); // by genre
    const endpoint = '/discover/movie?include_adult=false' + `&api_key=${key}` + `&with_genres=${genre}`;
    let parameters = '';
     // checks if filters were added
    if (filters) {
        const year = select('year'); // by year
        const lang = select('languages'); // by language
        const country = select('countries'); // by country
        const rating = select('top-rated'); // by rating
        parameters = `&primary_release_year=${year}` + `&with_original_language=${lang}` + `&with_origin_country=${country}` + `${rating}`
    }
    const url = baseUrl + endpoint + parameters;
    try {
        const responseA = await fetch(url); // First api call to fetch the total number of available pages
        if (responseA.ok) {
            const jsonA = await responseA.json();
            const pages = jsonA.total_pages
            if (pages > 0) {
                const page = Math.ceil(Math.random() * Math.min(pages, 500)); // Randomize the page of the results. Page number is capped at 500 because of the API limitations
                try {
                    const responseB = await fetch(url + `&page=${page}`) // Second api call to fetch films from a random page
                    if (responseB.ok) {
                        const jsonB = await responseB.json();
                        console.log(jsonB);
                        const films = jsonB.results;
                        return films
                    }
                }
                catch (error) { console.log(error) }
            }
            //Display alert if there are no films
            else { alert('There are no films in this category. Please change the filtering options') }

        }
    }
    catch (error) { console.log(error) }
}


//Display names of the genres
const genre_ids = [
    28, 12, 16, 35,
    80, 99, 18, 10751,
    14, 36, 27, 10402,
    9648, 10749, 878, 10770,
    53, 10752, 37
];

const genre_names = [
    'Action', 'Adventure',
    'Animation', 'Comedy',
    'Crime', 'Documentary',
    'Drama', 'Family',
    'Fantasy', 'History',
    'Horror', 'Music',
    'Mystery', 'Romance',
    'Science Fiction', 'TV Movie',
    'Thriller', 'War',
    'Western'
]

const filmGenres = (film, div) => {
    const film_genre_ids = film.genre_ids;
    let genres = '';
    for (id of film_genre_ids) {
        const index = genre_ids.indexOf(id);
        genres += genre_names[index] + "&#32";
    }
    const name = document.createElement('p');
        name.className = 'genre-name';
        name.innerHTML = genres;
        div.appendChild(name);
}


// Create HTML elements for films
const display = (films, index) => {
    let film = films[index];
    //Create card
    const div = document.createElement('div');
    div.className = 'film';
    container.appendChild(div);
    //Create poster if any
    if (film.poster_path) {
        const image = document.createElement('img');
        image.src = `https://image.tmdb.org/t/p/original/${film.poster_path}`
        image.setAttribute("width", '300px');
        image.setAttribute("height", '450px');
        image.setAttribute('alt', `${film.title} poster`)
        div.appendChild(image);
    }
    //Create title
    const node = document.createElement('h1');
    node.innerHTML = film.title;
    div.appendChild(node);
    // Create year of release and rating
    const data = document.createElement('p');
    data.className = 'film-data';
    data.innerHTML = `${film.release_date.slice(0, 4)}` + "&nbsp" + "&nbsp" + "&nbsp" + "&nbsp" + "☆" + "&nbsp" + `${film.vote_average}`;
    div.appendChild(data);
      //Create genre names
    filmGenres(film, div);

    //Create description
    const description = document.createElement('p');
    description.innerHTML = film.overview;
    div.appendChild(description);
    
}



// Pick and display three random films
const displayFilms = async () => {

    // Remove previous results
    container.innerHTML = '';

    // Fetch films
    const films = await fetchFilms();

    // Chose three random films if there are more than three films available
    if (films.length > 3) {
        // Create three random non-repeating indices
        let index1 = Math.floor(Math.random() * films.length);
        let index2;
        do { index2 = Math.floor(Math.random() * films.length); }
        while (index2 === index1);
        let index3;
        do { index3 = Math.floor(Math.random() * films.length); }
        while (index3 === index1 || index3 === index2);
        const array = new Array(index1, index2, index3);

        // Create html elements
        for (const index of array) {
            display(films, index);
        }

    }
    // If there are <= three films then display them all
    else {
        for (let index = 0; index < films.length; index++) {
            display(films, index);
        }
    }
    //Scroll into view
    //document.getElementById('films').scrollIntoView();

}

// Display additional filters
const addFilters = () => {
    filters = true;
    filterOptions.style.display = 'flex';
    show.style.display = 'none';
    hide.style.display = 'block';

    addLanguages();
    addCountries();
}

const hideFilters = () => {
    filters = false;
    filterOptions.style.display = 'none';
    hide.style.display = 'none';
    show.style.display = 'block';
    checkbox.setAttribute('value', '');

}

//Alphabetical sort for a dropdown. This will be used for the lists of languages and counties
const sort = (data) => {
    data.sort((a, b) => {
        if (a.english_name < b.english_name) { return -1 }
        if (a.english_name > b.english_name) { return 1 }
        return 0
    });
    return data
}


// Display a dropdown of languages
const addLanguages = async () => {
    const select = document.getElementById('languages');
    const endpoint = '/configuration/languages'
    const data = await fetchList(endpoint);
    sort(data);
    for (const lang of data) {
        const node = document.createElement('option');
        node.innerHTML = lang.english_name;
        node.value = lang.iso_639_1;
        select.appendChild(node);
    }
}

// Display a dropdown of countries
const addCountries = async () => {
    const select = document.getElementById('countries');
    const endpoint = '/configuration/countries';
    const data = await fetchList(endpoint);
    console.log(data);
    sort(data);
    for (const lang of data) {
        const node = document.createElement('option');
        node.innerHTML = lang.english_name;
        node.value = lang.iso_3166_1;
        select.appendChild(node);
    }
}


addGenres();

const buttonFind = document.getElementById('find');
buttonFind.addEventListener('click', displayFilms);


show.addEventListener('click', addFilters);
hide.addEventListener('click', hideFilters);

checkbox.addEventListener('change', addRating);