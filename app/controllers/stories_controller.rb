# frozen_string_literal: true

class StoriesController < ApplicationController
  include ReactOnRailsPro::Stream

  STORY_TYPES = %w[top new best ask show job].freeze

  def index
    @hn_stories_props = {
      storyType: normalized_story_type(params[:type]),
      page: normalized_page(params[:page])
    }

    stream_view_containing_react_components(template: "stories/index")
  end

  private

  def normalized_story_type(raw_type)
    type = raw_type.to_s.downcase
    STORY_TYPES.include?(type) ? type : "top"
  end

  def normalized_page(raw_page)
    page = raw_page.to_i
    page.positive? ? page : 1
  end
end
