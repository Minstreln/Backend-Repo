class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    const queryObj = { ...this.queryString };
    const excludedFields = ['sort', 'limit', 'fields', 'page', 'q'];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);

    this.query.find(JSON.parse(queryStr));

    if (this.queryString.q) {
      const search = this.queryString.q;
      this.query.find({
        $or: [
          { position: { $regex: search, $options: 'i' } },
          { jobDescription: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } },
          { hiringCompany: { $regex: search, $options: 'i' } },
          { tags: { $regex: search, $options: 'i' } },
          { responsibility: { $regex: search, $options: 'i' } },
          { requirements: { $regex: search, $options: 'i' } },
          { skillsAndQualifications: { $regex: search, $options: 'i' } },
          { city: { $regex: search, $options: 'i' } },
        ],
      });
    }

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this.query;
  }
}
  
module.exports = APIFeatures;
  