# frozen_string_literal: true

class UsersController < ApplicationController
  include ReactOnRailsPro::Stream

  def show
    @hn_user_props = {
      userId: params[:id].to_s
    }

    stream_view_containing_react_components(template: "users/show")
  end
end
