// Define a Movie class
class Movie {
    constructor(id, title, description, image, year, releaseDate, language, budget, grossWorldwide, genres, isAdult, runtimeMinutes, averageRating, numVotes) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.image = image;
        this.year = year;
        this.releaseDate = releaseDate;
        this.language = language;
        this.budget = budget;
        this.grossWorldwide = grossWorldwide;
        this.genres = genres;
        this.isAdult = isAdult;
        this.runtimeMinutes = runtimeMinutes;
        this.averageRating = averageRating;
        this.numVotes = numVotes;
    }
}

const MOVIE_GENRES = [
    "Action", "Adventure", "Animation", "Biography", "Comedy", "Crime", "Documentary",
    "Drama", "Family", "Fantasy", "History", "Horror", "Music", "Musical",
    "Mystery", "Romance", "Sci-Fi", "Sport", "Thriller", "War", "Western"
];
window.MOVIE_GENRES = MOVIE_GENRES;

const port = "7062";
const address = "https://localhost:";

const MovieUtils = {
    ajaxCall: function(method, api, data, successCB, errorCB) {
        const jwtToken = localStorage.getItem('jwtToken');

        $.ajax({
            type: method,
            url: `${address}${port}${api}`,
            data: data,
            cache: false,
            contentType: "application/json",
            dataType: "json",
            headers: jwtToken ? { Authorization: `Bearer ${jwtToken}` } : {},
            success: successCB,
            error: errorCB
        });
    },

    formatGenres: function(genres) {
        if (!genres) return '<span class="genre-empty">Not specified</span>';
        const genreArray = Array.isArray(genres) ? genres : genres.split(',');
        const commonGenres = ["Action", "Comedy", "Drama", "Horror", "Sci-Fi", "Romance", "Thriller", "Documentary"];

        return genreArray.map(g => {
            const genre = g.trim();
            const dataAttr = commonGenres.includes(genre) ? `data-genre=\"${genre}\"` : '';
            return `<span class='genre-bubble' ${dataAttr}>${genre}</span>`;
        }).join('');
    },

    truncateDescription: function(description, length = 150) {
        return description ? description.substring(0, length) + '...' : 'No description available.';
    },

    formatDate: function(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    },

    formatNumber: function(num) {
        return Number(num || 0).toLocaleString();
    },

    createCardContent: function(movieInstance) {
        const content = $('<div>').addClass('movie-content');
        content.append($('<div>').addClass('movie-title').text(movieInstance.title));
        content.append($('<div>').addClass('movie-info').html('<strong>Year:</strong> ' + (movieInstance.year || 'N/A')));
        content.append($('<div>').addClass('movie-info').html('<strong>Description:</strong> ' + this.truncateDescription(movieInstance.description)));
        content.append($('<div>').addClass('movie-rating').html('<strong>Rating:</strong> ' + movieInstance.averageRating));
        const genresContainer = $('<div>').addClass('movie-info genres-container');
        genresContainer.append($('<strong>').text('Genres: '));
        genresContainer.append($(this.formatGenres(movieInstance.genres)));
        content.append(genresContainer);
        const footer = $('<div>').addClass('movie-footer mt-2').html(
            '<strong>Budget:</strong> $' + this.formatNumber(movieInstance.budget) +
            ' | <strong>Box Office:</strong> $' + this.formatNumber(movieInstance.grossWorldwide) +
            ' | <strong>Votes:</strong> ' + this.formatNumber(movieInstance.numVotes)
        );
        content.append(footer);
        return content;
    },

    createAddButton: function(movieInstance, index) {
        const addBtn = $('<button>').addClass('add-movie-btn').text('Add Movie').css({
            backgroundColor: '#007bff', color: 'white', border: 'none', padding: '8px 15px',
            marginTop: '10px', cursor: 'pointer', borderRadius: '4px'
        });

        addBtn.on('click', function() {
            const jwtToken = localStorage.getItem('jwtToken');
            if (!jwtToken) return window.location.href = "Auth/Login.html";
            const payload = JSON.parse(atob(jwtToken.split('.')[1]));
            const currentTime = Math.floor(Date.now() / 1000);
            if (payload.exp && payload.exp < currentTime) {
                localStorage.removeItem('jwtToken');
                return window.location.href = "Auth/Login.html";
            }

            const genresValue = Array.isArray(movieInstance.genres) ? movieInstance.genres.join(', ') : (movieInstance.genres || "string");
            const movieToAdd = {
                id: index + 1,
                url: "string",
                primaryTitle: movieInstance.title,
                description: movieInstance.description || "string",
                primaryImage: movieInstance.image || "string",
                year: movieInstance.year || 0,
                releaseDate: movieInstance.releaseDate || new Date().toISOString(),
                language: movieInstance.language || "string",
                budget: movieInstance.budget || 0,
                grossWorldwide: movieInstance.grossWorldwide || 0,
                genres: genresValue,
                isAdult: movieInstance.isAdult || false,
                runtimeMinutes: movieInstance.runtimeMinutes || 0,
                averageRating: movieInstance.averageRating || 0,
                numVotes: movieInstance.numVotes || 0
            };

            MovieUtils.ajaxCall("POST", "/api/movies", JSON.stringify(movieToAdd),
                data => MovieUtils.showSuccessMessage(data, addBtn),
                xhr => MovieUtils.showErrorMessage(xhr)
            );
        });

        return addBtn;
    },

    createDeleteButton: function(movieInstance) {
        const deleteBtn = $('<button>').addClass('delete-movie-btn').text('Delete Movie').css({
            backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '8px 15px',
            marginTop: '10px', cursor: 'pointer', borderRadius: '4px'
        });

        deleteBtn.on('click', function() {
            if (confirm("Are you sure you want to delete this movie?")) {
                MovieUtils.ajaxCall("DELETE", `/api/movies/${movieInstance.id}`, null,
                    () => { alert("Success! Movie deleted."); MovieUtils.initMyMoviesPage(); },
                    MovieUtils.showErrorMessage
                );
            }
        });

        return deleteBtn;
    },

    showSuccessMessage: function(data, buttonElement) {
        const box = $('<div>').addClass('message-box').css({
            padding: '10px', margin: '10px 0', borderRadius: '4px', fontSize: '14px',
            color: data === false ? '#856404' : '#155724',
            backgroundColor: data === false ? '#fff3cd' : '#d4edda',
            border: data === false ? '1px solid #ffeeba' : '1px solid #c3e6cb'
        }).text(data === false ? "The movie was not added." : "Success! Movie added.");

        $(buttonElement).after(box);
        setTimeout(() => box.fadeOut(500, () => box.remove()), 3000);
    },

    showErrorMessage: function(xhr) {
        const container = $('#movies-container');
        container.html('<div style="grid-column: 1/-1; padding: 10px; background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;">Error: ' + (xhr.responseJSON?.message || 'An error occurred.') + '</div>');
    },

    createMovieCard: function(movie, index, isMyMovies = false) {
        const movieInstance = new Movie(
            movie.id, movie.primaryTitle, movie.description, movie.primaryImage,
            movie.year || movie.startYear, movie.releaseDate, movie.language,
            movie.budget, movie.grossWorldwide, movie.genres,
            movie.isAdult, movie.runtimeMinutes, movie.averageRating, movie.numVotes
        );

        const card = $('<div>').addClass('movie-card');
        if (movieInstance.image) {
            const img = $('<img>').addClass('movie-img').attr('src', movieInstance.image).attr('alt', movieInstance.title);
            card.append(img);
        }

        const content = this.createCardContent(movieInstance);
        isMyMovies ? content.append(this.createDeleteButton(movieInstance)) : content.append(this.createAddButton(movieInstance, index));
        card.append(content);
        return card;
    },

    displayMovies: function(movies, container, isMyMovies = false) {
        container.empty();
        if (movies && movies.length > 0) {
            $.each(movies, function(index, movie) {
                const card = MovieUtils.createMovieCard(movie, index, isMyMovies);
                container.append(card);
                let moviesbtn=document.getElementById("loadMoviesBtn");
                moviesbtn.style.display='none';
            });
        } else {
            container.html('<div style="grid-column: 1/-1; padding: 10px; background-color: #fff3cd; color: #856404; border: 1px solid #ffeeba;">No movie data available.</div>');
        }
    },

    loadServerMovies: function() {
        const container = $('#movies-container');
        container.html('<div style="grid-column: 1/-1; text-align: center; padding: 20px;">Loading movies...</div>');

        MovieUtils.ajaxCall("GET", "/api/movies", null,
            data => MovieUtils.displayMovies(data, container, false),
            MovieUtils.showErrorMessage
        );
    },

    initIndexPage: function () {
        const container = $('#movies-container');
        container.html('<div style="grid-column: 1/-1; text-align: center; padding: 20px;">Loading movies...</div>');

        if (typeof movies !== 'undefined' && Array.isArray(movies)) {
            MovieUtils.displayMovies(movies, container, false);
        } else {
            MovieUtils.showErrorMessage({ 
                responseJSON: { 
                    message: 'Movies data not available. Make sure movies.js is properly loaded.' 
                } 
            });
        }
    },

    initMyMoviesPage: function () {
        const container = $('#movies-container');
        container.html('<div style="grid-column: 1/-1; text-align: center; padding: 20px;">Loading your movies...</div>');

        MovieUtils.ajaxCall("GET", "/api/movies", null,
            data => MovieUtils.displayMovies(data, container, true),
            MovieUtils.showErrorMessage
        );
    }
};

window.MovieUtils = MovieUtils;
