class LoadingIndicator {
  static show() {
    const loadingElement = document.createElement('div');
    loadingElement.className = 'loading-container';
    loadingElement.innerHTML = '<div class="loading-spinner"></div>';
    return loadingElement;
  }

  static hide() {
    const loadingElement = document.querySelector('.loading-container');
    if (loadingElement) {
      loadingElement.remove();
    }
  }
}

export default LoadingIndicator;