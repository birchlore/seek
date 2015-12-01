class AnalyticsController < ApplicationController

  def increase_trailer_views
    analytic = current_user.analytic
    analytic.increase_trailer_views
    
    respond_to do |format|
      format.json { head :ok }
    end
  end


end
