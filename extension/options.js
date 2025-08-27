// Options page functionality for Universal Form Filler
class OptionsManager {
  constructor() {
    this.currentProfileId = null;
    this.profiles = {};
    this.isEditing = false;
    
    this.initializeElements();
    this.setupEventListeners();
    this.init();
  }

  initializeElements() {
    // Main elements
    this.profileSelect = document.getElementById('profileSelect');
    this.newProfileBtn = document.getElementById('newProfile');
    this.deleteProfileBtn = document.getElementById('deleteProfile');
    this.saveBtn = document.getElementById('saveBtn');
    this.cancelBtn = document.getElementById('cancelBtn');
    this.statusEl = document.getElementById('status');
    
    // Form elements
    this.profileName = document.getElementById('profileName');
    this.firstName = document.getElementById('firstName');
    this.lastName = document.getElementById('lastName');
    this.fullName = document.getElementById('fullName');
    this.email = document.getElementById('email');
    this.phone = document.getElementById('phone');
    this.dateOfBirth = document.getElementById('dateOfBirth');
    
    // Address elements
    this.street = document.getElementById('street');
    this.city = document.getElementById('city');
    this.state = document.getElementById('state');
    this.zipCode = document.getElementById('zipCode');
    this.country = document.getElementById('country');
    
    // Document elements
    this.resume = document.getElementById('resume');
    this.resumeDisplay = document.getElementById('resumeDisplay');
    this.coverLetter = document.getElementById('coverLetter');
    
    // Links elements
    this.linkedin = document.getElementById('linkedin');
    this.github = document.getElementById('github');
    this.portfolio = document.getElementById('portfolio');
    this.website = document.getElementById('website');
    
    // Skills and emergency contact
    this.skills = document.getElementById('skills');
    this.emergencyName = document.getElementById('emergencyName');
    this.emergencyPhone = document.getElementById('emergencyPhone');
    this.emergencyRelationship = document.getElementById('emergencyRelationship');
    this.emergencyEmail = document.getElementById('emergencyEmail');
    
    // Dynamic lists
    this.experienceList = document.getElementById('experienceList');
    this.educationList = document.getElementById('educationList');
    this.customFieldsList = document.getElementById('customFieldsList');
    this.addExperienceBtn = document.getElementById('addExperience');
    this.addEducationBtn = document.getElementById('addEducation');
    this.addCustomFieldBtn = document.getElementById('addCustomField');
  }

  setupEventListeners() {
    // Profile management
    this.profileSelect.addEventListener('change', () => this.loadProfile());
    this.newProfileBtn.addEventListener('click', () => this.newProfile());
    this.deleteProfileBtn.addEventListener('click', () => this.deleteProfile());
    this.saveBtn.addEventListener('click', () => this.saveProfile());
    this.cancelBtn.addEventListener('click', () => this.cancel());
    
    // Section toggles
    document.querySelectorAll('.section-header').forEach(header => {
      header.addEventListener('click', () => this.toggleSection(header));
    });
    
    // Auto-fill full name
    this.firstName.addEventListener('input', () => this.updateFullName());
    this.lastName.addEventListener('input', () => this.updateFullName());
    
    // File input handling
    this.resume.addEventListener('change', () => this.handleFileInput());
    this.resumeDisplay.addEventListener('dragover', (e) => this.handleDragOver(e));
    this.resumeDisplay.addEventListener('drop', (e) => this.handleFileDrop(e));
    
    // Dynamic list management
    this.addExperienceBtn.addEventListener('click', () => this.addExperienceItem());
    this.addEducationBtn.addEventListener('click', () => this.addEducationItem());
    this.addCustomFieldBtn.addEventListener('click', () => this.addCustomFieldItem());
  }

  async init() {
    await this.loadProfiles();
    this.checkUrlParams();
  }

  checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    if (editId && this.profiles[editId]) {
      this.profileSelect.value = editId;
      this.loadProfile();
    }
  }

  async loadProfiles() {
    try {
      const result = await chrome.storage.local.get(['profiles']);
      this.profiles = result.profiles || {};
      
      // Update profile selector
      this.profileSelect.innerHTML = '<option value="">New Profile</option>';
      Object.entries(this.profiles).forEach(([id, profile]) => {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = profile.name || `Profile ${id}`;
        this.profileSelect.appendChild(option);
      });
    } catch (error) {
      this.showStatus('Error loading profiles: ' + error.message, 'error');
    }
  }

  loadProfile() {
    const profileId = this.profileSelect.value;
    
    if (!profileId) {
      this.newProfile();
      return;
    }
    
    const profile = this.profiles[profileId];
    if (!profile) {
      this.showStatus('Profile not found', 'error');
      return;
    }
    
    this.currentProfileId = profileId;
    this.isEditing = true;
    this.deleteProfileBtn.style.display = 'inline-block';
    
    // Load basic info
    this.profileName.value = profile.name || '';
    
    // Load personal info
    if (profile.personal) {
      this.firstName.value = profile.personal.firstName || '';
      this.lastName.value = profile.personal.lastName || '';
      this.fullName.value = profile.personal.fullName || '';
      this.email.value = profile.personal.email || '';
      this.phone.value = profile.personal.phone || '';
      this.dateOfBirth.value = profile.personal.dateOfBirth || '';
    }
    
    // Load address
    if (profile.address) {
      this.street.value = profile.address.street || '';
      this.city.value = profile.address.city || '';
      this.state.value = profile.address.state || '';
      this.zipCode.value = profile.address.zipCode || '';
      this.country.value = profile.address.country || '';
    }
    
    // Load documents
    if (profile.documents) {
      this.coverLetter.value = profile.documents.coverLetter || '';
      if (profile.documents.resumeFileName) {
        this.resumeDisplay.textContent = `📄 ${profile.documents.resumeFileName}`;
        this.resumeDisplay.classList.add('has-file');
      }
    }
    
    // Load links
    if (profile.links) {
      this.linkedin.value = profile.links.linkedin || '';
      this.github.value = profile.links.github || '';
      this.portfolio.value = profile.links.portfolio || '';
      this.website.value = profile.links.website || '';
    }
    
    // Load skills
    if (profile.skills && Array.isArray(profile.skills)) {
      this.skills.value = profile.skills.join(', ');
    }
    
    // Load emergency contact
    if (profile.emergencyContact) {
      this.emergencyName.value = profile.emergencyContact.name || '';
      this.emergencyPhone.value = profile.emergencyContact.phone || '';
      this.emergencyRelationship.value = profile.emergencyContact.relationship || '';
      this.emergencyEmail.value = profile.emergencyContact.email || '';
    }
    
    // Load experience
    this.loadExperienceItems(profile.experience || []);
    
    // Load education
    this.loadEducationItems(profile.education || []);
    
    // Load custom fields
    this.loadCustomFieldItems(profile.customFields || []);
  }

  newProfile() {
    this.currentProfileId = null;
    this.isEditing = false;
    this.profileSelect.value = '';
    this.deleteProfileBtn.style.display = 'none';
    this.clearForm();
  }

  clearForm() {
    // Clear all form fields
    document.querySelectorAll('input, textarea, select').forEach(field => {
      if (field.id !== 'profileSelect' && field.id !== 'country') {
        field.value = '';
      }
    });
    
    // Reset country to default
    this.country.value = 'United States';
    
    // Clear file display
    this.resumeDisplay.textContent = 'Click to select resume file or drag and drop';
    this.resumeDisplay.classList.remove('has-file');
    
    // Clear dynamic lists
    this.experienceList.innerHTML = '';
    this.educationList.innerHTML = '';
    this.customFieldsList.innerHTML = '';
  }

  async saveProfile() {
    const profileData = this.collectFormData();
    
    if (!profileData.name) {
      this.showStatus('Please enter a profile name', 'error');
      return;
    }
    
    try {
      // Generate ID for new profiles
      if (!this.currentProfileId) {
        this.currentProfileId = 'profile_' + Date.now();
      }
      
      // Handle resume file
      if (this.resume.files.length > 0) {
        const file = this.resume.files[0];
        profileData.documents.resumeFileName = file.name;
        profileData.documents.resumeData = await this.fileToBase64(file);
      }
      
      // Save to storage
      this.profiles[this.currentProfileId] = profileData;
      await chrome.storage.local.set({ profiles: this.profiles });
      
      // Update UI
      await this.loadProfiles();
      this.profileSelect.value = this.currentProfileId;
      this.isEditing = true;
      this.deleteProfileBtn.style.display = 'inline-block';
      
      this.showStatus('Profile saved successfully!', 'success');
    } catch (error) {
      this.showStatus('Error saving profile: ' + error.message, 'error');
    }
  }

  collectFormData() {
    return {
      name: this.profileName.value.trim(),
      personal: {
        firstName: this.firstName.value.trim(),
        lastName: this.lastName.value.trim(),
        fullName: this.fullName.value.trim(),
        email: this.email.value.trim(),
        phone: this.phone.value.trim(),
        dateOfBirth: this.dateOfBirth.value
      },
      address: {
        street: this.street.value.trim(),
        city: this.city.value.trim(),
        state: this.state.value.trim(),
        zipCode: this.zipCode.value.trim(),
        country: this.country.value.trim()
      },
      documents: {
        coverLetter: this.coverLetter.value.trim(),
        resumeFileName: this.profiles[this.currentProfileId]?.documents?.resumeFileName || '',
        resumeData: this.profiles[this.currentProfileId]?.documents?.resumeData || ''
      },
      links: {
        linkedin: this.linkedin.value.trim(),
        github: this.github.value.trim(),
        portfolio: this.portfolio.value.trim(),
        website: this.website.value.trim()
      },
      skills: this.skills.value.split(',').map(s => s.trim()).filter(s => s),
      emergencyContact: {
        name: this.emergencyName.value.trim(),
        phone: this.emergencyPhone.value.trim(),
        relationship: this.emergencyRelationship.value.trim(),
        email: this.emergencyEmail.value.trim()
      },
      experience: this.collectExperienceData(),
      education: this.collectEducationData(),
      customFields: this.collectCustomFieldData()
    };
  }

  async deleteProfile() {
    if (!this.currentProfileId || !confirm('Are you sure you want to delete this profile?')) {
      return;
    }
    
    try {
      delete this.profiles[this.currentProfileId];
      await chrome.storage.local.set({ profiles: this.profiles });
      
      await this.loadProfiles();
      this.newProfile();
      this.showStatus('Profile deleted successfully', 'success');
    } catch (error) {
      this.showStatus('Error deleting profile: ' + error.message, 'error');
    }
  }

  cancel() {
    if (this.isEditing) {
      this.loadProfile();
    } else {
      this.clearForm();
    }
  }

  toggleSection(header) {
    const sectionName = header.dataset.section;
    const content = document.getElementById(sectionName + '-section');
    const icon = header.querySelector('.toggle-icon');
    
    if (content.classList.contains('active')) {
      content.classList.remove('active');
      icon.classList.remove('rotated');
    } else {
      content.classList.add('active');
      icon.classList.add('rotated');
    }
  }

  updateFullName() {
    const first = this.firstName.value.trim();
    const last = this.lastName.value.trim();
    if (first || last) {
      this.fullName.value = `${first} ${last}`.trim();
    }
  }

  handleFileInput() {
    const file = this.resume.files[0];
    if (file) {
      this.resumeDisplay.textContent = `📄 ${file.name}`;
      this.resumeDisplay.classList.add('has-file');
    }
  }

  handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  handleFileDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      this.resume.files = files;
      this.handleFileInput();
    }
  }

  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Experience management
  addExperienceItem(data = {}) {
    const item = document.createElement('div');
    item.className = 'list-item';
    item.innerHTML = `
      <button type="button" class="remove-item" onclick="this.parentElement.remove()">×</button>
      <div class="form-row">
        <div class="form-group">
          <label>Company</label>
          <input type="text" class="exp-company" value="${data.company || ''}">
        </div>
        <div class="form-group">
          <label>Position</label>
          <input type="text" class="exp-position" value="${data.position || ''}">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Start Date</label>
          <input type="date" class="exp-start" value="${data.startDate || ''}">
        </div>
        <div class="form-group">
          <label>End Date</label>
          <input type="date" class="exp-end" value="${data.endDate || ''}">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group full-width">
          <label>Description</label>
          <textarea class="exp-description" rows="3">${data.description || ''}</textarea>
        </div>
      </div>
    `;
    this.experienceList.appendChild(item);
  }

  loadExperienceItems(experiences) {
    this.experienceList.innerHTML = '';
    experiences.forEach(exp => this.addExperienceItem(exp));
  }

  collectExperienceData() {
    const items = this.experienceList.querySelectorAll('.list-item');
    return Array.from(items).map(item => ({
      company: item.querySelector('.exp-company').value.trim(),
      position: item.querySelector('.exp-position').value.trim(),
      startDate: item.querySelector('.exp-start').value,
      endDate: item.querySelector('.exp-end').value,
      description: item.querySelector('.exp-description').value.trim()
    })).filter(exp => exp.company || exp.position);
  }

  // Education management
  addEducationItem(data = {}) {
    const item = document.createElement('div');
    item.className = 'list-item';
    item.innerHTML = `
      <button type="button" class="remove-item" onclick="this.parentElement.remove()">×</button>
      <div class="form-row">
        <div class="form-group">
          <label>Institution</label>
          <input type="text" class="edu-institution" value="${data.institution || ''}">
        </div>
        <div class="form-group">
          <label>Degree</label>
          <input type="text" class="edu-degree" value="${data.degree || ''}">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Field of Study</label>
          <input type="text" class="edu-field" value="${data.fieldOfStudy || ''}">
        </div>
        <div class="form-group">
          <label>Graduation Year</label>
          <input type="number" class="edu-year" value="${data.graduationYear || ''}" min="1950" max="2030">
        </div>
      </div>
    `;
    this.educationList.appendChild(item);
  }

  loadEducationItems(education) {
    this.educationList.innerHTML = '';
    education.forEach(edu => this.addEducationItem(edu));
  }

  collectEducationData() {
    const items = this.educationList.querySelectorAll('.list-item');
    return Array.from(items).map(item => ({
      institution: item.querySelector('.edu-institution').value.trim(),
      degree: item.querySelector('.edu-degree').value.trim(),
      fieldOfStudy: item.querySelector('.edu-field').value.trim(),
      graduationYear: item.querySelector('.edu-year').value
    })).filter(edu => edu.institution || edu.degree);
  }

  // Custom Fields management
  addCustomFieldItem(data = {}) {
    const item = document.createElement('div');
    item.className = 'list-item';
    item.innerHTML = `
      <button type="button" class="remove-item" onclick="this.parentElement.remove()">×</button>
      <div class="form-row">
        <div class="form-group">
          <label>Field Label</label>
          <input type="text" class="custom-label" value="${data.label || ''}" placeholder="e.g., Desired Salary, Years of Experience">
        </div>
        <div class="form-group">
          <label>Field Value</label>
          <input type="text" class="custom-value" value="${data.value || ''}" placeholder="e.g., $75,000, 5 years">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group full-width">
          <label>CSS Selectors (optional)</label>
          <input type="text" class="custom-selectors" value="${data.selectors || ''}" placeholder="e.g., input[name='salary'], input[id*='experience']">
          <small style="color: #666; display: block; margin-top: 4px;">
            Leave empty for auto-detection, or specify CSS selectors to help find the field
          </small>
        </div>
      </div>
    `;
    this.customFieldsList.appendChild(item);
  }

  loadCustomFieldItems(customFields) {
    this.customFieldsList.innerHTML = '';
    customFields.forEach(field => this.addCustomFieldItem(field));
  }

  collectCustomFieldData() {
    const items = this.customFieldsList.querySelectorAll('.list-item');
    return Array.from(items).map(item => ({
      label: item.querySelector('.custom-label').value.trim(),
      value: item.querySelector('.custom-value').value.trim(),
      selectors: item.querySelector('.custom-selectors').value.trim()
    })).filter(field => field.label && field.value);
  }

  showStatus(message, type = 'success') {
    this.statusEl.textContent = message;
    this.statusEl.className = `status ${type}`;
    this.statusEl.style.display = 'block';
    
    setTimeout(() => {
      this.statusEl.style.display = 'none';
    }, 5000);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new OptionsManager();
});