class MoviesController < ApplicationController
  def index
    @movies = Movie.where(status:"current")
    count = @movies.count
    @movie = Movie.find(rand(1..count))
  end

  def create
  end

  def new
  end

  def update
  end

  def edit
  end

  def show
    @movie = Movie.find(movie_params[:id])
  end

  protected

   # def movie_params
   #  params.require(:movie).permit(
   #    :title, :description, :embed)
   # end


end
