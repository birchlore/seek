class User < ActiveRecord::Base
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable,
         :omniauthable, :omniauth_providers => [:facebook]
  has_many :movie_ratings
  has_many :movies, :through => :movie_ratings



    def self.from_omniauth(auth)
      where(provider: auth.provider, uid: auth.uid).first_or_create do |user|
        user.email = auth.info.email
        user.birthday = auth.extra.raw_info.birthday
        user.gender = auth.extra.raw_info.gender
        user.password = Devise.friendly_token[0,20]
        user.first_name = auth.extra.raw_info.first_name   # assuming the user model has a name
        user.last_name = auth.extra.raw_info.last_name   # assuming the user model has a name
        user.image = auth.info.image # assuming the user model has an image
      end
    end


    def self.new_with_session(params, session)
      super.tap do |user|
        if data = session["devise.facebook_data"] && session["devise.facebook_data"]["extra"]["raw_info"]
          user.email = data["email"] if user.email.blank?
        end
      end
    end

    def current_unrated_movies
      my_current_movies = self.movies.where(status:"current")
      ids = my_current_movies.map{|x| x.id}

      all_current_movies = Movie.where(status:"current")
      unrated_movies = all_current_movies.reject{|x| ids.include? x.id}
    end

    def wants_to_see_movies
      self.movies.where(movie_ratings: { wants_to_see: true } )
    end


end
