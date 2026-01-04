import React, { useState, useRef } from 'react';
import './App.css';
import propertiesData from '../public/properties.json';

// Simple Icon Components using Unicode and CSS
const Icons = {
  X: () => <span className="icon">✕</span>,
  Bed: () => <span className="icon">🛏️</span>,
  MapPin: () => <span className="icon">📍</span>,
  Calendar: () => <span className="icon">📅</span>,
  ChevronLeft: () => <span className="icon">‹</span>,
  ChevronRight: () => <span className="icon">›</span>,
  Star: () => <span className="icon">⭐</span>,
};

const PropertySearchApp = () => {
  const [searchCriteria, setSearchCriteria] = useState({
    type: '',
    minPrice: '',
    maxPrice: '',
    minBedrooms: '',
    maxBedrooms: '',
    dateFrom: '',
    dateTo: '',
    postcode: ''
  });

  const [filteredProperties, setFilteredProperties] = useState(propertiesData.properties);
  const [favourites, setFavourites] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [draggedProperty, setDraggedProperty] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [showFavourites, setShowFavourites] = useState(false);

  const favouritesRef = useRef(null);

  // Helper function to convert month name to index
  const getMonthIndex = (monthName) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    return months.indexOf(monthName);
  };

  // Search functionality
  const handleSearch = (e) => {
    e.preventDefault();

    const filtered = propertiesData.properties.filter(property => {
      // Type filter
      if (searchCriteria.type && searchCriteria.type !== 'Any' &&
        property.type !== searchCriteria.type) {
        return false;
      }

      // Price filters
      if (searchCriteria.minPrice && property.price < parseInt(searchCriteria.minPrice)) {
        return false;
      }
      if (searchCriteria.maxPrice && property.price > parseInt(searchCriteria.maxPrice)) {
        return false;
      }

      // Bedroom filters
      if (searchCriteria.minBedrooms && property.bedrooms < parseInt(searchCriteria.minBedrooms)) {
        return false;
      }
      if (searchCriteria.maxBedrooms && property.bedrooms > parseInt(searchCriteria.maxBedrooms)) {
        return false;
      }

      // Postcode filter
      if (searchCriteria.postcode && !property.postcode.toLowerCase().includes(searchCriteria.postcode.toLowerCase())) {
        return false;
      }

      // Date filters
      const propertyDate = new Date(property.added.year, getMonthIndex(property.added.month), property.added.day);

      if (searchCriteria.dateFrom) {
        const fromDate = new Date(searchCriteria.dateFrom);
        if (propertyDate < fromDate) return false;
      }

      if (searchCriteria.dateTo) {
        const toDate = new Date(searchCriteria.dateTo);
        if (propertyDate > toDate) return false;
      }

      return true;
    });

    setFilteredProperties(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchCriteria(prev => ({ ...prev, [name]: value }));
  };

  const resetSearch = () => {
    setSearchCriteria({
      type: '',
      minPrice: '',
      maxPrice: '',
      minBedrooms: '',
      maxBedrooms: '',
      dateFrom: '',
      dateTo: '',
      postcode: ''
    });
    setFilteredProperties(propertiesData.properties);
  };

  // Favourites functionality
  const addToFavourites = (property) => {
    if (!favourites.find(fav => fav.id === property.id)) {
      setFavourites(prev => [...prev, property]);
    }
  };

  const removeFromFavourites = (propertyId) => {
    setFavourites(prev => prev.filter(fav => fav.id !== propertyId));
  };

  const clearFavourites = () => {
    setFavourites([]);
  };

  // Drag and drop functionality
  const handleDragStart = (e, property) => {
    setDraggedProperty(property);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropOnFavourites = (e) => {
    e.preventDefault();
    if (draggedProperty) {
      addToFavourites(draggedProperty);
      setDraggedProperty(null);
    }
  };

  const handleDropRemove = (e) => {
    e.preventDefault();
    if (draggedProperty && favourites.find(fav => fav.id === draggedProperty.id)) {
      removeFromFavourites(draggedProperty.id);
      setDraggedProperty(null);
    }
  };

  // Property detail functionality
  const openPropertyDetail = (property) => {
    setSelectedProperty(property);
    setCurrentImageIndex(0);
    setActiveTab('description');
  };

  const closePropertyDetail = () => {
    setSelectedProperty(null);
  };

  const nextImage = () => {
    if (selectedProperty) {
      setCurrentImageIndex((prev) =>
        (prev + 1) % selectedProperty.images.length
      );
    }
  };

  const prevImage = () => {
    if (selectedProperty) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? selectedProperty.images.length - 1 : prev - 1
      );
    }
  };

  const formatPrice = (price) => {
    return `£${price.toLocaleString()}`;
  };

  // Property Detail View
  if (selectedProperty) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="property-detail-container">
          <button
            onClick={closePropertyDetail}
            className="close-detail-btn"
          >
            <Icons.X />
          </button>

          <div className="property-detail-content">
            {/* Image Gallery */}
            <div className="property-gallery">
              <div className="main-image-container">
                <img
                  src={selectedProperty.images[currentImageIndex]}
                  alt={selectedProperty.location}
                  className="main-image"
                />
                <button onClick={prevImage} className="gallery-nav-btn gallery-nav-left">
                  <Icons.ChevronLeft />
                </button>
                <button onClick={nextImage} className="gallery-nav-btn gallery-nav-right">
                  <Icons.ChevronRight />
                </button>
              </div>

              <div className="thumbnail-container">
                {selectedProperty.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`View ${idx + 1}`}
                    className={`thumbnail ${idx === currentImageIndex ? 'thumbnail-active' : ''}`}
                    onClick={() => setCurrentImageIndex(idx)}
                  />
                ))}
              </div>
            </div>

            {/* Property Info */}
            <div className="property-info-section">
              <div className="property-header">
                <div>
                  <h1 className="property-title">{selectedProperty.location}</h1>
                  <p className="property-price">{(selectedProperty.price)}</p>
                  <span className="meta-item">{selectedProperty.type}</span>

                </div>

              </div>



              {/* Tabs */}
              <div className="tabs-container">
                <div className="tabs-header">
                  <button
                    onClick={() => setActiveTab('description')}
                    className={`tab-btn ${activeTab === 'description' ? 'tab-btn-active' : ''}`}
                  >
                    Description
                  </button>
                  <button
                    onClick={() => setActiveTab('floorplan')}
                    className={`tab-btn ${activeTab === 'floorplan' ? 'tab-btn-active' : ''}`}
                  >
                    Floor Plan
                  </button>
                  <button
                    onClick={() => setActiveTab('map')}
                    className={`tab-btn ${activeTab === 'map' ? 'tab-btn-active' : ''}`}
                  >
                    Map
                  </button>
                </div>

                <div className="tab-content">
                  {activeTab === 'description' && (
                    <div>
                      <h2 className="section-title">Property Description</h2>
                      <p className="description-text">{selectedProperty.description}</p>
                      <p className="description-text mt-4">{selectedProperty.longDescription}</p>
                      <div className="mt-6">
                        <h3 className="font-semibold text-gray-900 mb-2">Key Features</h3>
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                          <li>{selectedProperty.tenure} property</li>
                          <li>{selectedProperty.bedrooms} bedroom {selectedProperty.type.toLowerCase()}</li>
                          <li>Added {selectedProperty.added.month} {selectedProperty.added.year}</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {activeTab === 'floorplan' && (
                    <div>
                      <h2 className="section-title">Floor Plan</h2>
                      <img
                        src={selectedProperty.floorPlan}
                        alt="Floor Plan"
                        className="w-full rounded-lg shadow-md"
                      />
                    </div>
                  )}

                  {activeTab === 'map' && (
                    <div>
                      <h2 className="section-title">Location Map</h2>
                      <div className="map-container">
                        <iframe
                          width="100%"
                          height="100%"
                          frameBorder="0"
                          style={{ border: 0 }}
                          src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(selectedProperty.locationpath)}`}
                          allowFullScreen
                          title="Property Location"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div >
    );
  }

  // Main Search View
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">

            <span className="logo-text">CEYLON NEST</span>
          </div>
        </div>
      </header>

      <div className="main-container">
        {/* Search Section */}
        <div className="search-section">
          <h1 className="search-title">Find Your Perfect Property</h1>

          <form onSubmit={handleSearch} className="search-form">
            <div className="form-grid">
              {/* Property Type */}
              <div className="form-group">
                <label className="form-label">

                  Property Type
                </label>
                <select
                  name="type"
                  value={searchCriteria.type}
                  onChange={handleInputChange}
                  className="form-input"
                  aria-label="Property Type"
                >
                  <option value="">Any</option>
                  <option value="House">House</option>
                  <option value="Flat">Flat</option>
                </select>
              </div>

              {/* Min Price */}
              <div className="form-group">
                <label className="form-label" htmlFor="minPrice">Min Price</label>
                <input
                  type="number"
                  id="minPrice"
                  name="minPrice"
                  value={searchCriteria.minPrice}
                  onChange={handleInputChange}
                  placeholder="£0"
                  className="form-input"
                  min="0"
                  step="10000"
                  aria-label="Minimum Price"
                />
              </div>

              {/* Max Price */}
              <div className="form-group">
                <label className="form-label" htmlFor="maxPrice">Max Price</label>
                <input
                  type="number"
                  id="maxPrice"
                  name="maxPrice"
                  value={searchCriteria.maxPrice}
                  onChange={handleInputChange}
                  placeholder="No max"
                  className="form-input"
                  min="0"
                  step="10000"
                  aria-label="Maximum Price"
                />
              </div>

              {/* Min Bedrooms */}
              <div className="form-group">
                <label className="form-label" htmlFor="minBedrooms">

                  Min Bedrooms
                </label>
                <input
                  type="number"
                  id="minBedrooms"
                  name="minBedrooms"
                  value={searchCriteria.minBedrooms}
                  onChange={handleInputChange}
                  placeholder="Any"
                  className="form-input"
                  min="0"
                  max="10"
                  aria-label="Minimum Bedrooms"
                />
              </div>

              {/* Max Bedrooms */}
              <div className="form-group">
                <label className="form-label" htmlFor="maxBedrooms">Max Bedrooms</label>
                <input
                  type="number"
                  id="maxBedrooms"
                  name="maxBedrooms"
                  value={searchCriteria.maxBedrooms}
                  onChange={handleInputChange}
                  placeholder="Any"
                  className="form-input"
                  min="0"
                  max="10"
                  aria-label="Maximum Bedrooms"
                />
              </div>

              {/* Postcode */}
              <div className="form-group">
                <label className="form-label" htmlFor="postcode">

                  Postcode Area
                </label>
                <input
                  type="text"
                  id="postcode"
                  name="postcode"
                  value={searchCriteria.postcode}
                  onChange={handleInputChange}
                  placeholder="e.g. BR1, BR5"
                  className="form-input"
                  maxLength="10"
                  aria-label="Postcode Area"
                />
              </div>

              {/* Date From */}
              <div className="form-group">
                <label className="form-label" htmlFor="dateFrom">

                  Added From
                </label>
                <input
                  type="date"
                  id="dateFrom"
                  name="dateFrom"
                  value={searchCriteria.dateFrom}
                  onChange={handleInputChange}
                  className="form-input"
                  aria-label="Date Added From"
                />
              </div>

              {/* Date To */}
              <div className="form-group">
                <label className="form-label" htmlFor="dateTo">Added To</label>
                <input
                  type="date"
                  id="dateTo"
                  name="dateTo"
                  value={searchCriteria.dateTo}
                  onChange={handleInputChange}
                  className="form-input"
                  aria-label="Date Added To"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-search">

                Search Properties
              </button>
              <button type="button" onClick={resetSearch} className="btn-reset">
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Results and Favourites Layout */}
        <div className="results-layout">
          {/* Properties Results */}
          <div className="results-section">
            <div className="results-header">
              <h2 className="results-title">
                {filteredProperties.length} {filteredProperties.length === 1 ? 'Property' : 'Properties'} Found
              </h2>
            </div>

            <div className="properties-grid">
              {filteredProperties.map(property => (
                <article
                  key={property.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, property)}
                  className="property-card"
                >
                  <div className="property-image-container" onClick={() => openPropertyDetail(property)}>
                    <img
                      src={property.picture}
                      alt={`Property at ${property.location}`}
                      className="property-image"
                    />

                  </div>

                  <div className="property-content">
                    <div className="property-price-badge">
                      {(property.price)}
                    </div>

                    <h3 className="property-location">{property.location}</h3>

                    <p className="property-description">
                      {property.description.substring(0, 120)}...
                    </p>

                    <div className="property-features">
                      <span className="feature-item">
                        <Icons.Bed />
                        {property.bedrooms} bed
                      </span>
                      <span className="feature-item">
                        <Icons.MapPin />
                        {property.postcode}
                      </span>
                      <span className="feature-item">
                        <Icons.Calendar />
                        {property.added.month.substring(0, 3)} {property.added.year}
                      </span>
                    </div>

                    <div className="property-actions">
                      <button
                        onClick={() => openPropertyDetail(property)}
                        className="btn-view"
                        aria-label={`View details for ${property.location}`}
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => addToFavourites(property)}
                        className={`btn-favourite ${favourites.find(fav => fav.id === property.id) ? 'btn-favourite-active' : ''}`}
                        disabled={favourites.find(fav => fav.id === property.id)}
                        aria-label={favourites.find(fav => fav.id === property.id) ? 'Already in favourites' : 'Add to favourites'}
                      >
                        <Icons.Star />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {filteredProperties.length === 0 && (
              <div className="no-results">
                <Icons.Home />
                <p className="text-gray-500 text-lg">No properties match your search criteria</p>
                <button onClick={resetSearch} className="mt-4 btn-reset">
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {/* Favourites Sidebar */}
          <aside
            ref={favouritesRef}
            onDragOver={handleDragOver}
            onDrop={handleDropOnFavourites}
            className={`favourites-sidebar ${showFavourites ? 'favourites-sidebar-show' : ''}`}
            aria-label="Saved Properties"
          >
            <div className="favourites-header">
              <h3 className="favourites-title">
                Saved Properties
              </h3>
              {favourites.length > 0 && (
                <button onClick={clearFavourites} className="btn-clear" aria-label="Clear all saved properties">

                  Clear All
                </button>
              )}
            </div>

            <div
              onDragOver={handleDragOver}
              onDrop={handleDropRemove}
              className="favourites-list"
            >
              {favourites.length === 0 ? (
                <div className="favourites-empty">
                  <p className="text-sm text-gray-500 text-center">
                    No saved properties yet. Drag properties here or click the Star icon.
                  </p>
                </div>
              ) : (
                favourites.map(property => (
                  <div
                    key={property.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, property)}
                    className="favourite-item"
                  >
                    <img
                      src={property.picture}
                      alt={`Saved property at ${property.location}`}
                      className="favourite-image"
                      onClick={() => openPropertyDetail(property)}
                    />
                    <div className="favourite-content">
                      <h4 className="favourite-location">{property.location}</h4>
                      <p className="favourite-price">{(property.price)}</p>

                    </div>
                    <button
                      onClick={() => removeFromFavourites(property.id)}
                      className="btn-remove"
                      aria-label={`Remove ${property.location} from favourites`}
                    >
                      <Icons.X />
                    </button>
                  </div>
                ))
              )}
            </div>

            {favourites.length > 0 && (
              <div className="favourites-footer">
                <p className="text-xs text-gray-500 text-center">
                  Drag properties out to remove from favourites
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default PropertySearchApp;