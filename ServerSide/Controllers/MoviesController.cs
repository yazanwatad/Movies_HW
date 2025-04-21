﻿using Microsoft.AspNetCore.Mvc;
using ServerSide_HW.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace ServerSide_HW.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MoviesController : ControllerBase
    {
        private int? GetUserIdFromToken()
        {
            var identity = HttpContext.User.Identity as ClaimsIdentity;
            if (identity != null)
            {
                var userIdClaim = identity.FindFirst("id");
                if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
                {
                    return userId;
                }
            }
            return null;
        }

        [HttpGet]
        public ActionResult<IEnumerable<Movie>> Get()
        {
            var userId = GetUserIdFromToken();
            if (userId == null)
                return Unauthorized("User ID not found in token");

            return Ok(Movie.Read(userId.Value));
        }

     

        [HttpGet("byTitle/{title}")]
        public ActionResult<IEnumerable<Movie>> GetByTitle(string title)
        {
            var userId = GetUserIdFromToken();
            if (userId == null)
                return Unauthorized("User ID not found in token");

            return Ok(Movie.GetByTitle(userId.Value, title));
        }

        [HttpGet("byReleaseDate")]
        public ActionResult<IEnumerable<Movie>> GetByReleaseDate(DateTime startDate, DateTime endDate)
        {
            var userId = GetUserIdFromToken();
            if (userId == null)
                return Unauthorized("User ID not found in token");

            return Ok(Movie.GetByReleaseDate(userId.Value, startDate, endDate));
        }

        [HttpPost]
        public ActionResult<bool> Post([FromBody] Movie movie)
        {
            var userId = GetUserIdFromToken();
            if (userId == null)
                return Unauthorized("User ID not found in token");

            try
            {
                movie.UserId = userId.Value; // Assign userId to the movie
                return Ok(movie.Insert());   // Use instance method
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return BadRequest(e.Message);
            }
        }

        [HttpDelete("{id}")]
        public ActionResult<bool> Delete(int id)
        {
            var userId = GetUserIdFromToken();
            if (userId == null)
                return Unauthorized("User ID not found in token");

            return Ok(Movie.DeleteMovie(userId.Value, id));
        }
    }
}
