class UserNotificationMailer < ApplicationMailer

  def message_received(sender_id, receiver_id, message_id)
    @sender = User.find(sender_id)
    @receiver = User.find(receiver_id)
    @body = Message.find(message_id).body
    mail(to: @receiver.email, subject: "#{@sender.first_name} sent you a message on Seek")
  end

end