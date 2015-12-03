class Movie < ActiveRecord::Base
  has_many :movie_ratings
  has_many :users, :through => :movie_ratings

  def users_who_want_to_see
    self.users.where(seed: true).where(movie_ratings: { wants_to_see: true, seen: false } )
  end

end
