class AddTrailerViewsToAnalytics < ActiveRecord::Migration
  def change
    add_column :analytics, :trailer_views, :integer, :default => 0
  end
end
