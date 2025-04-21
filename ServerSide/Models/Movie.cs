﻿namespace ServerSide_HW.Models
{
    public class Movie
    {
        int id;
        string url;
        string primaryTitle;
        string description;
        string primaryImage;
        int year;
        DateTime releaseDate;
        string language;
        double budget;
        double grossWorldwide;
        string genres;
        bool isAdult;
        int runtimeMinutes;
        float averageRating;
        int numVotes;
        int userId; // a way to save added movies for each user independently  

        static Dictionary<int, List<Movie>> UserMovies = new(); 

        public Movie() {}

        public Movie(int id, string url, string primaryTitle, string description, string primaryImage, int year, DateTime releaseDate, string language, double budget, double grossWorldwide, string genres, bool isAdult, int runtimeMinutes, float averageRating, int numVotes)
        {
            this.id = id;
            this.url = url;
            this.primaryTitle = primaryTitle;
            this.description = description;
            this.primaryImage = primaryImage;
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

        public int Id { get => id; set => id = value; }
        public string Url { get => url; set => url = value; }
        public string PrimaryTitle { get => primaryTitle; set => primaryTitle = value; }
        public string Description { get => description; set => description = value; }
        public string PrimaryImage { get => primaryImage; set => primaryImage = value; }
        public int Year { get => year; set => year = value; }
        public DateTime ReleaseDate { get => releaseDate; set => releaseDate = value; }
        public string Language { get => language; set => language = value; }
        public double Budget { get => budget; set => budget = value; }
        public double GrossWorldwide { get => grossWorldwide; set => grossWorldwide = value; }
        public string Genres { get => genres; set => genres = value; }
        public bool IsAdult { get => isAdult; set => isAdult = value; }
        public int RuntimeMinutes { get => runtimeMinutes; set => runtimeMinutes = value; }
        public float AverageRating { get => averageRating; set => averageRating = value; }
        public int NumVotes { get => numVotes; set => numVotes = value; }
        public int UserId { get => userId; set => userId = value; } // way to save movies for each user(ID) independently

        public bool Insert()
        {
            try
            {
                ValidateMovie();
                if (!UserMovies.ContainsKey(userId))
                    UserMovies[userId] = new List<Movie>();

                UserMovies[userId].Add(this);
                return true;
            }
            catch
            {
                return false;
            }
        }

        public static List<Movie> Read(int userId)
        {
            if (UserMovies.ContainsKey(userId))
                return UserMovies[userId];
            return new List<Movie>();
        }

        public static List<Movie> GetByTitle(int userId, string title)
        {
            return Read(userId).Where(m => m.primaryTitle.Contains(title, StringComparison.OrdinalIgnoreCase)).ToList();
        }

        public static List<Movie> GetByReleaseDate(int userId, DateTime startDate, DateTime endDate)
        {
            return Read(userId).Where(m => m.releaseDate >= startDate && m.releaseDate <= endDate).ToList();
        }

        public static bool DeleteMovie(int userId, int id)
        {
            var userMovies = Read(userId);
            var movie = userMovies.FirstOrDefault(m => m.Id == id);
            if (movie != null)
            {
                userMovies.Remove(movie);
                return true;
            }
            return false;
        }

        public bool ValidateMovie()
        {
            if (string.IsNullOrEmpty(primaryTitle)) throw new Exception("Title required");
            return true;
        }
    }
}
