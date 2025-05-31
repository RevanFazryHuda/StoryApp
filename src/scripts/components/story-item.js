import { showFormattedDate } from '../utils/index.js';

class StoryItem extends HTMLElement {
  set story(story) {
    this._story = story;
    this.render();
  }

  render() {
    this.innerHTML = `
      <article class="story-item">
        <img src="${this._story.photoUrl}" alt="${this._story.name ? this._story.name + "'s story" : "User's story"}" class="story-image">
        <div class="story-content">
          <h3 class="story-title">${this._story.name}</h3>
          <p class="story-description">${this._truncateDescription(this._story.description)}</p>
          <p class="story-date">${showFormattedDate(this._story.createdAt)}</p>
          <a href="/detail/${this._story.id}" class="read-more-button">Baca Selengkapnya</a>
        </div>
        ${this._story.lat && this._story.lon ? `
          <div class="story-map" id="map-${this._story.id}" data-lat="${this._story.lat}" data-lon="${this._story.lon}"></div>
        ` : ''}
      </article>
    `;
    
    this.querySelector('.story-item').addEventListener('click', (e) => {
      if (e.target.tagName === 'A') return;
      window.location.href = `/detail/${this._story.id}`;
    });
  }

  _truncateDescription(description) {
    if (description.length > 100) {
      return description.substring(0, 100) + '...';
    }
    return description;
  }
}

if (!customElements.get('story-item')) {
  customElements.define('story-item', StoryItem);
}

export default StoryItem;