class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  private

  def shared_hn_props
    {
      commitHash: current_commit_hash
    }.compact
  end

  def current_commit_hash
    ENV["GIT_COMMIT"].presence || ENV["GITHUB_SHA"].presence
  end
end
