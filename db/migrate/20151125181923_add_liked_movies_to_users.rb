class AddLikedMoviesToUsers < ActiveRecord::Migration
  def change
    add_column :users, :liked_movies, :text
  end
end
