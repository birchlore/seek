class ChangeAnalyticColumns < ActiveRecord::Migration
  def change
     change_column :analytics, :movie_clicks, :integer, :default => 0
     change_column :analytics, :user_clicks, :integer, :default => 0
     change_column :analytics, :logins, :integer, :default => 0
  end
end
