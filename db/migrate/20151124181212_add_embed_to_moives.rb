class AddEmbedToMoives < ActiveRecord::Migration
  def change
    add_column :movies, :embed, :text
  end
end
