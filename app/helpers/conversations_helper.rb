module ConversationsHelper
  def mailbox_section(title, current_box, opts = {})
    opts[:class] = opts.fetch(:class, '')
    opts[:class] += ' active' if title.downcase == current_box
    content_tag :li, link_to(title.capitalize, conversations_path(box: title.downcase)), opts
  end

  def participant_names(conversation)
    conversation.receipts.reject { |p| p.receiver == current_user }.collect {|p| p.receiver.name }.uniq.join(" ,")
  end

   def participant_ids(conversation)
    conversation.receipts.reject { |p| p.receiver == current_user }.collect {|p| p.receiver.id }.uniq.join(" ,")
  end

  
end
