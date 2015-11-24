class AddSeenToMovieRatings < ActiveRecord::Migration
  def change
    add_column :movie_ratings, :seen, :boolean, :default => false
  end
end
