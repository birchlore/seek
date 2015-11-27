namespace :db do
  desc "fill database"
  task :populate => :environment do
    require 'faker'


    def random_birthday
      month = "01"
      day = "10"
      year = (1968..1995).to_a.sample
      "#{month}/#{day}/#{year}"
    end
  

    puts "creating 10 users..."  

      @count = 1
      genders = ["male", "female"]

      100.times do
        response = HTTParty.get("http://api.randomuser.me/").parsed_response
        image = response['results'][0]['user']['picture']['medium']
        first_name = response['results'][0]['user']['name']['first']
        last_name = response['results'][0]['user']['name']['last']
        email = response['results'][0]['user']['email']
        birthday = random_birthday
        user = User.new(location: "Vancouver, British Columbia", first_name: first_name, birthday: birthday, last_name: last_name, email: email, gender: genders.sample, password: '12341234', image: image, seed: true)
        if user.save
          puts "User #{@count} created" 
          @count += 1
        end
      end


    def wants_to_see?
      num = (1..10).to_a.sample
      num < 4 ? true : false
    end

    puts "creating 30 movie ratings..."

    @movie_rated_count = 0

    User.all.each do |user|
      movie_ids = (1..Movie.count).to_a

      3.times do 
        movie_ids.shuffle!
        id = movie_ids.pop
        user.movie_ratings.create(movie_id: id, wants_to_see: wants_to_see?)
        @movie_rated_count += 1
        puts "#{@movie_rated_count} movies rated!"
      end
    end







  end
end
