class JobFactory {
  jobs: any[]
  constructor() {
    this.jobs = []
  }

  create(job: any) {
    this.jobs = [job, ...this.jobs]
  }

}