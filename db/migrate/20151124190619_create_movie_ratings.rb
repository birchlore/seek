class CreateMovieRatings < ActiveRecord::Migration
  def change
    create_table :movie_ratings do |t|
      t.references :movie, index: true, foreign_key: true
      t.references :user, index: true, foreign_key: true
      t.boolean :wants_to_see

      t.timestamps null: false
    end
  end
end
