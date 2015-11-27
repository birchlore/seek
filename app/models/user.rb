class User < ActiveRecord::Base
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable,
         :omniauthable, :omniauth_providers => [:facebook]
  has_many :movie_ratings, :dependent => :destroy
  has_many :movies, :through => :movie_ratings
  has_many :sent_messages, :class_name => 'Message', :foreign_key => 'sender_id'
  has_many :received_messages, :class_name => 'Message', :foreign_key => 'recipient_id'
  acts_as_messageable



    def self.from_omniauth(auth)
      where(provider: auth.provider, uid: auth.uid).first_or_create do |user|
        user.email = auth.info.email
        user.birthday = auth.extra.raw_info.birthday
        user.gender = auth.extra.raw_info.gender
        user.location = auth.extra.raw_info.location.name
        user.password = Devise.friendly_token[0,20]
        user.first_name = auth.extra.raw_info.first_name   # assuming the user model has a name
        user.last_name = auth.extra.raw_info.last_name   # assuming the user model has a name
        user.image = auth.info.image # assuming the user model has an image
        user.liked_movies = auth.extra.raw_info.movies
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
      self.movies.where(status:'current').where(movie_ratings: { wants_to_see: true, seen: false } )
    end

    def potential_matches
      User.joins(:movies).where(movies: { id: Movie.joins(:users).where(users: { id: self.id }).joins(:movie_ratings).where(movie_ratings: { wants_to_see: true })}).uniq
    end

    def name
      first_name.titleize + last_name.upcase[0] + "."
    end

    def mailboxer_email(object)
      email
    end

    def birth_year
      self.birthday.scan(/\d{4}/).first.to_i
    end

    def birth_month
      matches = self.birthday.scan(/\d{2}\//)
      return unless matches.count == 2
      matches.first.scan(/\d{2}/).first.to_i
    end

    def birth_day
      matches = self.birthday.scan(/\d{2}\//)
      return unless matches.count == 2
      matches.last.scan(/\d{2}/).first.to_i
    end

    def age
      return unless birth_year && birth_month && birth_day
      now = Time.now.utc.to_date
      age = now.year - self.birth_year - ((now.month > self.birth_month || (now.month == self.birth_month && now.day >= self.birth_day)) ? 0 : 1)
      age.to_s
    end

    def city
      return unless self.location
      self.location.split.first.gsub(',', '')
    end

    def potential_matches

    end


end
