class AddSeedToUsers < ActiveRecord::Migration
  def change
    add_column :users, :seed, :boolean, :default => false
  end
end
