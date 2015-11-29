module UsersHelper

  def age(user)
    " " + user.age if user.age
  end

  def avatar_image(user, size)
    if user.avatar_file_size
      image_tag(current_user.avatar(size.to_sym), :class=> "avatar img-circle img-thumbnail", :style=>"width: 50px; height:50px")
    else
      image_tag(current_user.image, :class=> "avatar img-circle img-thumbnail", :style=>"height:50px")
    end
  end

  def avatar_source(user,size)
    if user.avatar_file_size
      user.avatar(size.to_sym)
    else
      user.image
    end
  end

  def city(user)
    ", " + current_user.city if current_user.city
  end

  def potential_matches_count(user)
    user.potential_matches ? user.potential_matches.count : 0
  end

  def wants_to_see_movies(user)
    count = user.wants_to_see_movies.count

    case count
    when 0
      "Doesn't want to see any movies"
    when 1
      "Wants to see " + user.wants_to_see_movies.first.title.titleize
    when 2
      movies = user.wants_to_see_movies
      "Wants to see " + movies.first.title.titleize + " and " + movies.last.title.titleize
    else
      strings = ["Wants to see "]
      movies = user.wants_to_see_movies

      movies.each_with_index do |movie, index|
        if index == 0
          strings << movie.title.titleize
        elsif index == movies.count - 1
          strings << ", and " + movie.title.titleize
        else
          strings << ", " + movie.title.titleize
        end
      end 

      strings.join("")

    end
  end

end
