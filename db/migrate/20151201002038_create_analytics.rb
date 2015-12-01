class CreateAnalytics < ActiveRecord::Migration
  def change
    create_table :analytics do |t|
      t.references :user, index: true, foreign_key: true
      t.integer :movie_clicks
      t.integer :user_clicks
      t.integer :logins

      t.timestamps null: false
    end
  end
end
