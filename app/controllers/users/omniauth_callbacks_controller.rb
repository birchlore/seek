class Users::OmniauthCallbacksController < Devise::OmniauthCallbacksController
   def facebook
    # You need to implement the method below in your model (e.g. app/models/user.rb)
    @user = User.from_omniauth(request.env["omniauth.auth"])

    if @user.persisted?

      sign_in_and_redirect @user, :event => :authentication #this will throw if @user is not activated
      set_flash_message(:notice, :success, :kind => "Facebook") if is_navigational_format?

      if @user.analytic.logins < 1
        finished(:user_signup)
        NotificationMailer.new_user_notification(@user.id).deliver_now
      end
      
      @user.analytic.logins += 1
      @user.analytic.save
      NotificationMailer.new_sign_in(@user.id).deliver_now

    else
      session["devise.facebook_data"] = request.env["omniauth.auth"]
      redirect_to new_user_session_url
    end
  end
end
