// Popup functionality for Universal Form Filler

// This function runs in the context of the webpage
function fillFormScript(profile) {
    const setNativeInputValue = (element, value) => {
      try {
        const prototype = element instanceof HTMLTextAreaElement
          ? HTMLTextAreaElement.prototype
          : element instanceof HTMLInputElement
            ? HTMLInputElement.prototype
            : HTMLSelectElement.prototype;
        const valueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
        if (valueSetter) {
          valueSetter.call(element, value);
        } else {
          element.value = value;
        }
      } catch (e) {
        element.value = value;
      }
    };

    const dispatchInputEvents = (element) => {
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
    };

    const fillField = (selectors, value, type = 'text') => {
      if (!value) return false;
      
      for (const selector of selectors) {
        try {
          const elements = document.querySelectorAll(selector);
          for (const el of elements) {
            if (el.offsetParent !== null || el.tagName === 'INPUT') { // Check if visible
              el.focus();
              
              if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                if (type === 'file' && el.type === 'file') {
                  // Handle file inputs differently - we'll show a message
                  continue;
                }
                setNativeInputValue(el, value);
                dispatchInputEvents(el);
              } else if (el.tagName === 'SELECT') {
                // Try to find matching option
                const options = Array.from(el.options);
                const matchingOption = options.find(opt => 
                  opt.text.toLowerCase().includes(value.toLowerCase()) ||
                  opt.value.toLowerCase().includes(value.toLowerCase())
                );
                if (matchingOption) {
                  el.value = matchingOption.value;
                  dispatchInputEvents(el);
                }
              } else {
                el.textContent = value;
              }
              return true;
            }
          }
        } catch (e) {
          console.warn('Error filling field with selector:', selector, e);
        }
      }
      return false;
    };

    const uploadResume = (resumeData, resumeFileName) => {
      if (!resumeData || !resumeFileName) return false;
      
      try {
        // Find file input fields
        const fileInputs = document.querySelectorAll('input[type="file"]');
        for (const fileInput of fileInputs) {
          // Check if it's a resume-related field
          const fieldName = fileInput.name || fileInput.id || '';
          const isResumeField = fieldName.toLowerCase().includes('resume') || 
                               fieldName.toLowerCase().includes('cv') ||
                               fieldName.toLowerCase().includes('file');
          
          if (isResumeField) {
            // Convert base64 to file
            const byteString = atob(resumeData.split(',')[1]);
            const mimeString = resumeData.split(',')[0].split(':')[1].split(';')[0];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i);
            }
            const file = new File([ab], resumeFileName, { type: mimeString });
            
            // Create a new FileList-like object
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileInput.files = dataTransfer.files;
            
            // Trigger events
            fileInput.dispatchEvent(new Event('change', { bubbles: true }));
            return true;
          }
        }
      } catch (e) {
        console.warn('Error uploading resume:', e);
      }
      return false;
    };

    let filledCount = 0;

    // Personal Information
    if (profile.personal) {
      const p = profile.personal;
      if (fillField(['input[name*="first"]', 'input[id*="first"]', 'input[placeholder*="First"]'], p.firstName)) filledCount++;
      if (fillField(['input[name*="last"]', 'input[id*="last"]', 'input[placeholder*="Last"]'], p.lastName)) filledCount++;
      if (fillField(['input[name*="name"]', 'input[id*="name"]', 'input[placeholder*="Name"]'], p.fullName || `${p.firstName || ''} ${p.lastName || ''}`.trim())) filledCount++;
      if (fillField(['input[type="email"]', 'input[name*="email"]', 'input[id*="email"]'], p.email)) filledCount++;
      if (fillField(['input[type="tel"]', 'input[name*="phone"]', 'input[id*="phone"]'], p.phone)) filledCount++;
      if (fillField(['input[name*="date"]', 'input[id*="birth"]', 'input[type="date"]'], p.dateOfBirth)) filledCount++;
    }

    // Address Information
    if (profile.address) {
      const a = profile.address;
      if (fillField(['input[name*="address"]', 'input[id*="address"]', 'input[placeholder*="Address"]'], a.street)) filledCount++;
      if (fillField(['input[name*="city"]', 'input[id*="city"]', 'input[placeholder*="City"]'], a.city)) filledCount++;
      if (fillField(['input[name*="state"]', 'input[id*="state"]', 'select[name*="state"]'], a.state)) filledCount++;
      if (fillField(['input[name*="zip"]', 'input[name*="postal"]', 'input[id*="zip"]'], a.zipCode)) filledCount++;
      if (fillField(['input[name*="country"]', 'input[id*="country"]', 'select[name*="country"]'], a.country)) filledCount++;
    }

    // Professional Links
    if (profile.links) {
      const l = profile.links;
      if (fillField(['input[name*="linkedin"]', 'input[id*="linkedin"]', 'input[placeholder*="LinkedIn"]'], l.linkedin)) filledCount++;
      if (fillField(['input[name*="github"]', 'input[id*="github"]', 'input[placeholder*="GitHub"]'], l.github)) filledCount++;
      if (fillField(['input[name*="portfolio"]', 'input[id*="portfolio"]', 'input[placeholder*="Portfolio"]'], l.portfolio)) filledCount++;
      if (fillField(['input[name*="website"]', 'input[id*="website"]', 'input[placeholder*="Website"]'], l.website)) filledCount++;
    }

    // Work Experience
    if (profile.experience && profile.experience.length > 0) {
      const exp = profile.experience[0]; // Use most recent experience
      if (fillField(['input[name*="company"]', 'input[id*="company"]', 'input[placeholder*="Company"]'], exp.company)) filledCount++;
      if (fillField(['input[name*="position"]', 'input[name*="title"]', 'input[id*="position"]'], exp.position)) filledCount++;
      if (fillField(['textarea[name*="experience"]', 'textarea[id*="experience"]'], exp.description)) filledCount++;
    }

    // Education
    if (profile.education && profile.education.length > 0) {
      const edu = profile.education[0]; // Use most recent education
      if (fillField(['input[name*="school"]', 'input[name*="university"]', 'input[id*="school"]'], edu.institution)) filledCount++;
      if (fillField(['input[name*="degree"]', 'input[id*="degree"]'], edu.degree)) filledCount++;
      if (fillField(['input[name*="major"]', 'input[name*="field"]', 'input[id*="major"]'], edu.fieldOfStudy)) filledCount++;
    }

    // Skills
    if (profile.skills && profile.skills.length > 0) {
      const skillsText = profile.skills.join(', ');
      if (fillField(['textarea[name*="skill"]', 'input[name*="skill"]', 'textarea[id*="skill"]'], skillsText)) filledCount++;
    }

    // Emergency Contact
    if (profile.emergencyContact) {
      const ec = profile.emergencyContact;
      if (fillField(['input[name*="emergency"]', 'input[id*="emergency"]'], ec.name)) filledCount++;
      if (fillField(['input[name*="emergency"][type="tel"]', 'input[id*="emergency"][type="tel"]'], ec.phone)) filledCount++;
    }

    // Resume Upload
    if (profile.documents && profile.documents.resumeData && profile.documents.resumeFileName) {
      if (uploadResume(profile.documents.resumeData, profile.documents.resumeFileName)) {
        filledCount++;
      }
    }

    // Custom Fields
    if (profile.customFields && profile.customFields.length > 0) {
      for (const customField of profile.customFields) {
        if (customField.label && customField.value) {
          let selectors = [];
          
          // If custom selectors are provided, use them
          if (customField.selectors) {
            selectors = customField.selectors.split(',').map(s => s.trim()).filter(s => s);
          } else {
            // Auto-generate selectors based on label
            const labelLower = customField.label.toLowerCase();
            selectors = [
              `input[name*="${labelLower.replace(/\s+/g, '')}"]`,
              `input[id*="${labelLower.replace(/\s+/g, '')}"]`,
              `input[placeholder*="${customField.label}"]`,
              `textarea[name*="${labelLower.replace(/\s+/g, '')}"]`,
              `textarea[id*="${labelLower.replace(/\s+/g, '')}"]`,
              `textarea[placeholder*="${customField.label}"]`,
              `select[name*="${labelLower.replace(/\s+/g, '')}"]`,
              `select[id*="${labelLower.replace(/\s+/g, '')}"]`
            ];
          }
          
          if (fillField(selectors, customField.value)) {
            filledCount++;
          }
        }
      }
    }

    // Show result
    const message = filledCount > 0 
      ? `Form Filler: Successfully filled ${filledCount} fields!`
      : 'Form Filler: No matching fields found on this page.';
    
    // Create a temporary notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${filledCount > 0 ? '#28a745' : '#dc3545'};
      color: white;
      padding: 12px 20px;
      border-radius: 4px;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);

    return { filledCount };
}

class PopupManager {
  constructor() {
    this.profileSelect = document.getElementById('profileSelect');
    this.fillFormBtn = document.getElementById('fillForm');
    this.newProfileBtn = document.getElementById('newProfile');
    this.editProfileBtn = document.getElementById('editProfile');
    this.openOptionsBtn = document.getElementById('openOptions');
    this.statusEl = document.getElementById('status');
    
    this.init();
  }

  async init() {
    await this.loadProfiles();
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.fillFormBtn.addEventListener('click', () => this.fillCurrentForm());
    this.newProfileBtn.addEventListener('click', () => this.openOptions());
    this.editProfileBtn.addEventListener('click', () => this.openOptions());
    this.openOptionsBtn.addEventListener('click', () => this.openOptions());
    this.profileSelect.addEventListener('change', () => this.updateEditButton());
  }

  async loadProfiles() {
    try {
      const result = await chrome.storage.local.get(['profiles']);
      const profiles = result.profiles || {};
      
      // Clear existing options except the first one
      this.profileSelect.innerHTML = '<option value="">Select a profile...</option>';
      
      // Add profiles to select
      Object.entries(profiles).forEach(([id, profile]) => {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = profile.name || `Profile ${id}`;
        this.profileSelect.appendChild(option);
      });

      // Update button states
      this.updateEditButton();
    } catch (error) {
      this.showStatus('Error loading profiles', 'error');
    }
  }

  updateEditButton() {
    const hasSelection = this.profileSelect.value !== '';
    this.editProfileBtn.textContent = hasSelection ? 'Edit Profile' : 'New Profile';
  }

  async fillCurrentForm() {
    const selectedProfileId = this.profileSelect.value;
    if (!selectedProfileId) {
      this.showStatus('Please select a profile first', 'error');
      return;
    }

    try {
      // Get the selected profile
      const result = await chrome.storage.local.get(['profiles']);
      const profiles = result.profiles || {};
      const profile = profiles[selectedProfileId];

      if (!profile) {
        this.showStatus('Profile not found', 'error');
        return;
      }

      // Get current active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) {
        this.showStatus('No active tab found', 'error');
        return;
      }

      // Inject the form filling script and get results back
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: true },
        func: fillFormScript,
        args: [profile],
        world: 'MAIN'
      });

      const filledCount = Array.isArray(results)
        ? results.reduce((sum, r) => sum + (r && r.result && typeof r.result.filledCount === 'number' ? r.result.filledCount : 0), 0)
        : 0;

      if (filledCount > 0) {
        this.showStatus(`Form filled successfully! ${filledCount} field(s) updated.`, 'success');
      } else {
        this.showStatus('No matching fields found on this page.', 'error');
      }
    } catch (error) {
      console.error('Error filling form:', error);
      this.showStatus('Error filling form: ' + error.message, 'error');
    }
  }

  openOptions() {
    const selectedProfileId = this.profileSelect.value;
    const url = selectedProfileId 
      ? `options.html?edit=${selectedProfileId}`
      : 'options.html';
    chrome.tabs.create({ url: chrome.runtime.getURL(url) });
  }

  showStatus(message, type = 'info') {
    this.statusEl.textContent = message;
    this.statusEl.className = `status ${type}`;
    this.statusEl.style.display = 'block';
    
    setTimeout(() => {
      this.statusEl.style.display = 'none';
    }, 3000);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
});