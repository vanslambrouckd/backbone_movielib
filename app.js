var app = app || {};


//model
app.Movie = Backbone.Model.extend({
    defaults: {
        title: '',
        genre: '',
        year: '',
        summary: '',
        coverImage: 'http://ia.media-imdb.com/images/M/MV5BMjQzODQyMzk2Nl5BMl5BanBnXkFtZTcwNTg4MjQ3OA@@._V1_SX214_AL_.jpg',
        youtubeTrailer: ''
    }
});

//collection
app.Movies = Backbone.Collection.extend({
    model: app.Movie,
    localStorage: new Backbone.LocalStorage('movies-backbone')
})

//listitemview
app.ListItemView = Backbone.View.extend({
    events: {
        'click .jsDelete': 'deleteItem'
    },
    tagName: 'div',
    className: 'item',
    template: _.template($('#tplListItemView').html()),
    render: function() {
        this.$el.html(this.template(this.model.attributes));
        return this;
    },
    deleteItem: function(event) {
        this.model.destroy();
        this.remove(); //Removes a view from the DOM, and calls stopListening to remove any bound events that the view has listenTo'd. 
    }
});

//listview
app.ListView = Backbone.View.extend({
    el: '#movieslist',
    initialize: function() {
        //this.collection = new app.Movies(initialMovies);
        this.collection.fetch(); //fetch collection van server, nodig anders zie je de collectie niet
        this.render();
        this.listenTo(this.collection, 'add', this.renderMovie);
        //this.listenTo(this.collection, 'reset', this.render);
    },
    render: function() {
        console.log(this.collection);
        this.collection.each(function(item) {
            this.renderMovie(item);
        }, this);
    },
    renderMovie: function(item) {
        var movieView = new app.ListItemView({
            model: item
        });
        this.$el.append(movieView.render().el);
    }
});

app.addMovieView = Backbone.View.extend({
    /*
    <div class="ui form segment" id="frmAddMovie">
    */
    tagName: 'div',
    id: '#frmAddMovie',
    className: 'ui form segment',
    events: {
        'click #addMovie': 'addMovie'
    },
    template: _.template($('#tplAddMovie').html()),
    initialize: function() {
        this.render();
    },
    render: function() {
        this.$el.html(this.template());
        return this;
    },
    addMovie: function(event) {
        event.preventDefault();
        var formData = {};

        this.$el.find('[data-id]').each(function(i, el) {
            var $el = $(el);
            var dataId = $el.attr('data-id');
            if (dataId) {
                formData[dataId] = $el.val();
            }
        });
        console.log(formData);
        this.collection.create(formData);
    }
});


$(function() {

    var genres = ['Action', 'Comedy', 'Drama', 'Adventure'];
    genres.sort(function(a, b) {
        if (a < b) return -1;
        if (b < a) return 1;
        return 0;
    });
    console.log(genres);
    var movies = [];
    movies.push({
        title: 'Jurassic Park',
        genre: 'Adventure',
        year: 1993,
        summary: 'During a preview tour, a theme park suffers a major power breakdown that allows its cloned dinosaur exhibits to run amok.',
        coverImage: 'http://ia.media-imdb.com/images/M/MV5BMjQzODQyMzk2Nl5BMl5BanBnXkFtZTcwNTg4MjQ3OA@@._V1_SX214_AL_.jpg'

    });

    movies.push({
        title: 'The Shawshank Redemption',
        genre: 'Drama',
        year: 1994,
        summary: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
        coverImage: 'http://ia.media-imdb.com/images/M/MV5BODU4MjU4NjIwNl5BMl5BanBnXkFtZTgwMDU2MjEyMDE@._V1_SX214_AL_.jpg'
    });

    //app.movies = new app.Movies(movies);
    app.movies = new app.Movies();
    console.log(app.movies);


    $('#leftCol').html($('#tplCategories').html());

    var listView = new app.ListView({
        collection: app.movies
    });

    var frmAddMovieView = new app.addMovieView({
        collection: app.movies
    });
    console.log(frmAddMovieView.render().el);
    $('#content').prepend(frmAddMovieView.render().el);

    _.each(genres, function(genre) {
        $('#ddlGenres').append('<option value="' + genre + '">' + genre + '</option>');
    });
    $('select.dropdown').dropdown();
});