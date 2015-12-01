class Analytic < ActiveRecord::Base
  belongs_to :user

  def increase_movie_clicks_count
    self.movie_clicks += 1
    self.save
  end

  def increase_user_clicks
    self.user_clicks += 1
    self.save
  end

  def increase_trailer_views
    self.trailer_views += 1
    self.save
  end

  def messages_sent
    user = self.user
    user.messages.where(sender_id: user.id)
  end

  def messages_received
    user = self.user
    user.messages.where(receiver_id: user.id)
  end



end
