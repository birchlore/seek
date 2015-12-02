class AnalyticsController < ApplicationController

  def increase_trailer_views
    current_user.analytic.increase_trailer_views if current_user
    
    respond_to do |format|
      format.json { head :ok }
    end
  end

  def increase_user_clicks
    current_user.analytic.increase_user_clicks if current_user
    
    respond_to do |format|
      format.json { head :ok }
    end
  end


end
