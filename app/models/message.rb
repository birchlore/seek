class Message < ActiveRecord::Base
   belongs_to :sender, :class_name => 'User'
   belongs_to :recipient, :class_name => 'User'
   after_create :user_notification
   after_create :admin_notification

   private

   def user_notification
   end

   def admin_notification
    NotificationMailer.message_sent(self.sender.id, self.receiver.id, self.id).deliver_now
   end

end