var app = app || {};

//model
app.Movie = Backbone.Model.extend({
    defaults: {
        title: '',
        genre: '',
        year: '',
        summary: '',
        coverImage: 'http://ia.media-imdb.com/images/M/MV5BMjQzODQyMzk2Nl5BMl5BanBnXkFtZTcwNTg4MjQ3OA@@._V1_SX214_AL_.jpg'
    }
});

//collection
app.Movies = Backbone.Collection.extend({
    model: app.Movie
})

//listitemview
app.ListItemView = Backbone.View.extend({
    tagName: 'div',
    className: 'item',
    template: _.template($('#tplListItemView').html()),
    render: function() {
        this.$el.html(this.template(this.model.attributes));
        return this;
    }
});

//listview
app.ListView = Backbone.View.extend({
    el: '#movieslist',
    initialize: function(initialMovies) {
        this.collection = new app.Movies(initialMovies);
        this.render();
    },
    render: function() {
        this.collection.each(function(item) {
            this.renderMovie(item);
        }, this);
    },
    renderMovie: function(item) {
        console.log(item);
        var movieView = new app.ListItemView({
            model: item
        });
        console.log(movieView.render().el);
        this.$el.append(movieView.render().el);
    }
});


$(function() {
    var genres = ['Action', 'Comedy'];
    var movies = [];
    movies.push({
        title: 'Jurassic Park',
        genre: 'Adventure',
        year: 1993,
        summary: 'During a preview tour, a theme park suffers a major power breakdown that allows its cloned dinosaur exhibits to run amok.',
        coverImage: 'http://ia.media-imdb.com/images/M/MV5BMjQzODQyMzk2Nl5BMl5BanBnXkFtZTcwNTg4MjQ3OA@@._V1_SX214_AL_.jpg'

    });

    new app.ListView(movies);
});