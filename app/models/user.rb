class User < ActiveRecord::Base
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable,
         :omniauthable, :omniauth_providers => [:facebook]
  has_many :movie_ratings, :dependent => :destroy
  has_many :movies, :through => :movie_ratings
  has_many :sent_messages, :class_name => 'Message', :foreign_key => 'sender_id'
  has_many :received_messages, :class_name => 'Message', :foreign_key => 'recipient_id'
  has_one :analytic, :dependent => :destroy
  acts_as_messageable
  has_attached_file :avatar, 
                    styles: { :medium => "200x200>", :thumb => "50x50>", :micro => "30x30>" }
  validates_attachment_content_type :avatar, :content_type => /^image\/(png|gif|jpeg|jpg)/
  before_create :build_default_profile


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
      movie_ids = self.movie_ratings.where(wants_to_see: true, seen: false).map(&:movie_id)
      # find other users who rated 1 in those movies and get user_ids
      other_user_ids = MovieRating.where(wants_to_see: true, seen: false).where(movie_id: movie_ids).where.not(user_id: self.id).map(&:user_id).uniq
      # find those users with id 
      other_users = User.where(id: other_user_ids).where(seed: true)
    end

    def name
      first_name.titleize + " " + last_name.upcase[0] + "."
    end

    def mailboxer_email(object)
      email
    end

    def birth_year
      return unless self.birthday
      self.birthday.scan(/\d{4}/).first.to_i
    end

    def birth_month
      return unless self.birthday
      matches = self.birthday.scan(/\d{2}\//)
      return unless matches.count == 2
      matches.first.scan(/\d{2}/).first.to_i
    end

    def birth_day
      return unless self.birthday
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
      self.location.split(",").first
    end

    def matches_on_movie(movie)
      @users = movie.users_who_want_to_see.where.not(id: self.id)
    end


    private

    def build_default_profile
      @analytic = Analytic.new()
      self.analytic = @analytic
      true
    end



end
