Rails.application.routes.draw do
  rsc_payload_route
  root "stories#index"
  get "new", to: "stories#index", defaults: { type: "new" }, as: :new_stories
  get "new/:page", to: "stories#index", defaults: { type: "new" }, as: :new_stories_page
  get "best", to: "stories#index", defaults: { type: "best" }, as: :best_stories
  get "best/:page", to: "stories#index", defaults: { type: "best" }, as: :best_stories_page
  get "ask", to: "stories#index", defaults: { type: "ask" }, as: :ask_stories
  get "ask/:page", to: "stories#index", defaults: { type: "ask" }, as: :ask_stories_page
  get "show", to: "stories#index", defaults: { type: "show" }, as: :show_stories
  get "show/:page", to: "stories#index", defaults: { type: "show" }, as: :show_stories_page
  get "jobs", to: "stories#index", defaults: { type: "job" }, as: :job_stories
  get "jobs/:page", to: "stories#index", defaults: { type: "job" }, as: :job_stories_page
  get "news/:page", to: "stories#index", as: :news_page
  get "item/:id", to: "items#show", as: :item
  get "user/:id", to: "users#show", as: :user
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker
end
