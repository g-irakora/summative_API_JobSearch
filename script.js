
class JobSearchApp {
    constructor() {
        this.apiKey = '576b7ad0d6mshe043709676f6c7ep1bd3d9jsn34d5e6ecf45a';
        this.baseUrl = 'https://jsearch.p.rapidapi.com/search';
        this.jobs = [];
        this.filteredJobs = [];
        this.currentPage = 1;
        this.jobsPerPage = 10;
        
        this.initializeEventListeners();
        this.loadSampleData(); // Load sample data initially
    }

    initializeEventListeners() {
        document.getElementById('searchForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.searchJobs();
        });

        // Filter event listeners
        document.getElementById('employmentType').addEventListener('change', () => this.applyFilters());
        document.getElementById('remoteJobs').addEventListener('change', () => this.applyFilters());
        document.getElementById('companyFilter').addEventListener('input', () => this.applyFilters());
        document.getElementById('sortSelect').addEventListener('change', () => this.sortJobs());
    }

    async searchJobs() {
        const query = document.getElementById('query').value.trim();
        const location = document.getElementById('location').value.trim();
        const datePosted = document.getElementById('datePosted').value;

        if (!query) {
            this.showError('Please enter a job title or keywords');
            return;
        }

        this.showLoading(true);
        this.hideError();

        try {
            const searchQuery = location ? `${query} in ${location}` : query;
            const url = `${this.baseUrl}?query=${encodeURIComponent(searchQuery)}&page=1&num_pages=1&country=us&date_posted=${datePosted}`;
            
            const options = {
                method: 'GET',
                headers: {
                    'x-rapidapi-key': this.apiKey,
                    'x-rapidapi-host': 'jsearch.p.rapidapi.com'
                }
            };

            const response = await fetch(url, options);
            const data = await response.json();

            if (data.status === 'OK' && data.data) {
                this.jobs = data.data;
                this.filteredJobs = [...this.jobs];
                this.displayJobs();
                this.showFilters();
            } else {
                this.showError('No jobs found. Try different search terms.');
            }
        } catch (error) {
            console.error('Search error:', error);
            this.showError('Failed to search jobs. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }

    applyFilters() {
        const employmentType = document.getElementById('employmentType').value;
        const remoteJobs = document.getElementById('remoteJobs').value;
        const companyFilter = document.getElementById('companyFilter').value.toLowerCase();

        this.filteredJobs = this.jobs.filter(job => {
            if (employmentType && job.job_employment_type !== employmentType) return false;
            if (remoteJobs && job.job_is_remote.toString() !== remoteJobs) return false;
            if (companyFilter && !job.employer_name.toLowerCase().includes(companyFilter)) return false;
            return true;
        });

        this.currentPage = 1;
        this.displayJobs();
    }

    sortJobs() {
        const sortBy = document.getElementById('sortSelect').value;
        
        this.filteredJobs.sort((a, b) => {
            switch (sortBy) {
                case 'date':
                    return new Date(b.job_posted_at_datetime_utc || 0) - new Date(a.job_posted_at_datetime_utc || 0);
                case 'company':
                    return a.employer_name.localeCompare(b.employer_name);
                default:
                    return 0; // Keep original order for relevance
            }
        });

        this.displayJobs();
    }

    displayJobs() {
        const jobsGrid = document.getElementById('jobsGrid');
        const jobCount = document.getElementById('jobCount');
        const resultsHeader = document.getElementById('resultsHeader');

        if (this.filteredJobs.length === 0) {
            jobsGrid.innerHTML = '<div class="no-results">No jobs found matching your criteria.</div>';
            resultsHeader.style.display = 'none';
            return;
        }

        resultsHeader.style.display = 'flex';
        jobCount.textContent = `Found ${this.filteredJobs.length} job${this.filteredJobs.length !== 1 ? 's' : ''}`;

        // Pagination
        const startIndex = (this.currentPage - 1) * this.jobsPerPage;
        const endIndex = startIndex + this.jobsPerPage;
        const jobsToShow = this.filteredJobs.slice(startIndex, endIndex);

        jobsGrid.innerHTML = jobsToShow.map(job => this.createJobCard(job)).join('');
        this.createPagination();
    }

    createJobCard(job) {
        const salary = this.formatSalary(job);
        const qualifications = job.job_highlights?.Qualifications?.slice(0, 3) || [];
        const responsibilities = job.job_highlights?.Responsibilities?.slice(0, 2) || [];
        
        return `
            <div class="job-card">
                <div class="job-header">
                    <div>
                        <div class="job-title">${job.job_title}</div>
                        <div class="company-name">${job.employer_name}</div>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 5px; align-items: flex-end;">
                        ${job.job_is_remote ? '<span class="remote-badge">Remote</span>' : ''}
                        ${salary ? `<span class="salary-badge">${salary}</span>` : ''}
                    </div>
                </div>
                
                <div class="job-meta">
                    <div class="meta-item">${job.job_location}</div>
                    <div class="meta-item">${job.job_employment_type_text || job.job_employment_type}</div>
                    <div class="meta-item">${job.job_posted_human_readable}</div>
                </div>

                <div class="job-description">
                    ${job.job_description ? job.job_description.substring(0, 200) + '...' : 'No description available.'}
                </div>

                ${qualifications.length > 0 ? `
                    <div class="job-highlights">
                        <div class="highlight-section">
                            <div class="highlight-title">Key Requirements:</div>
                            <div class="highlight-list">
                                ${qualifications.map(qual => `<span class="highlight-item">${qual}</span>`).join('')}
                            </div>
                        </div>
                    </div>
                ` : ''}

                <div class="job-actions">
                    <a href="${job.job_apply_link}" target="_blank" class="apply-btn">Apply Now</a>
                    <button class="details-btn" onclick="this.showJobDetails('${job.job_id}')">View Details</button>
                </div>
            </div>
        `;
    }

    formatSalary(job) {
        if (job.job_min_salary && job.job_max_salary) {
            return `$${(job.job_min_salary / 1000).toFixed(0)}K - $${(job.job_max_salary / 1000).toFixed(0)}K`;
        } else if (job.job_salary) {
            return job.job_salary;
        }
        return null;
    }

    createPagination() {
        const pagination = document.getElementById('pagination');
        const totalPages = Math.ceil(this.filteredJobs.length / this.jobsPerPage);

        if (totalPages <= 1) {
            pagination.style.display = 'none';
            return;
        }

        pagination.style.display = 'flex';
        let paginationHTML = '';

        // Previous button
        paginationHTML += `
            <button class="page-btn" ${this.currentPage === 1 ? 'disabled' : ''} 
                    onclick="jobApp.goToPage(${this.currentPage - 1})">← Previous</button>
        `;

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === this.currentPage || i === 1 || i === totalPages || 
                (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
                paginationHTML += `
                    <button class="page-btn ${i === this.currentPage ? 'active' : ''}" 
                            onclick="jobApp.goToPage(${i})">${i}</button>
                `;
            } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
                paginationHTML += '<span class="page-btn">...</span>';
            }
        }

        // Next button
        paginationHTML += `
            <button class="page-btn" ${this.currentPage === totalPages ? 'disabled' : ''} 
                    onclick="jobApp.goToPage(${this.currentPage + 1})">Next →</button>
        `;

        pagination.innerHTML = paginationHTML;
    }

    goToPage(page) {
        this.currentPage = page;
        this.displayJobs();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    showJobDetails(jobId) {
        const job = this.jobs.find(j => j.job_id === jobId);
        if (job) {
            alert(`Job Details for: ${job.job_title}\n\nCompany: ${job.employer_name}\nLocation: ${job.job_location}\n\n${job.job_description?.substring(0, 300)}...`);
        }
    }

    showFilters() {
        document.getElementById('filtersSection').style.display = 'block';
    }

    showLoading(show) {
        const loading = document.getElementById('loadingIndicator');
        const searchBtn = document.getElementById('searchBtn');
        
        loading.style.display = show ? 'block' : 'none';
        searchBtn.disabled = show;
        searchBtn.textContent = show ? 'Searching...' : '🔍 Search Jobs';
    }

    showError(message) {
        const errorDiv = document.getElementById('errorMessage');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }

    hideError() {
        document.getElementById('errorMessage').style.display = 'none';
    }
}

// Initialize the app
const jobApp = new JobSearchApp();

// Make showJobDetails available globally
window.showJobDetails = (jobId) => {
    jobApp.showJobDetails(jobId);
};
