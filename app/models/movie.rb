class Movie < ActiveRecord::Base
  has_many :movie_ratings
  has_many :users, :through => :movie_ratings
end
