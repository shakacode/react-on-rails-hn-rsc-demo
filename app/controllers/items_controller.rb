# frozen_string_literal: true

class ItemsController < ApplicationController
  include ReactOnRailsPro::Stream

  def show
    @hn_item_props = {
      itemId: params[:id].to_i
    }

    stream_view_containing_react_components(template: "items/show")
  end
end
