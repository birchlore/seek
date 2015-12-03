class NotificationMailer < ApplicationMailer
  before_filter :set_recipients

  def new_user_notification(user_id)
    @user = User.find(user_id)
    mail(to: @recipients, subject: 'new user on seek')
  end

  def new_sign_in(user_id)
    @user = User.find(user_id)
    mail(to: @recipients, subject: "#{@user.first_name} has logged in")
  end

  def message_sent(sender_id, receiver_id, message)
    @sender = User.find(sender_id)
    @receiver = User.find(receiver_id)
    @body = message
    mail(to: @recipients, subject: "#{@sender.name} sent #{@receiver.name} a message!")
  end

  private

  def set_recipients
    @recipients = ["jackson@pixelburst.co", "rnadel@gmail.com"]
  end

end