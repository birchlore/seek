module MoviesHelper

  def city(user)
    "in " + user.city + " " if user.city
  end

end
