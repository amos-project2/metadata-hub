export class FormGraphQl {


    /**
     * you can set the members with the implicit setter-method
     */
    constructor() {

        this.limitIntern = 0;
        this.offsetIntern = 0;

        this.sortingIntern = {
            attribut: null,
            asc: true
        }


        this.fileHashes = "";

        this.limit = "";
        this.offset = "";
        this.showDeleted = "";
        this.deleted = "";
        this.startDate = "";
        this.endDate = "";

        this.startDateUpdated = "";
        this.endDateUpdated = "";

        this.filterOption = "";
        this.filterCustomString = "";

        this.attributes = "";

        this.filetypes = "";


        this.options_options = "";
        this.options_attributes = "";
        this.options_values = "";

        this.sortAttribut = "";
        this.sortOption = "";
    }

    getLimit() {
        return this.limitIntern;
    }

    getOffset() {
        return this.offsetIntern;
    }

    // sortBy: [String!], sortBy_options: [SortByOption!]
    setSorting(data) {
        this.sortingIntern = data;
        this.sortAttribut = data.attribute;

        if (this.sortAttribut === "id") {
            this.sortAttribut = `sortBy: ["id"]`;
        } else {
            this.sortAttribut = `sortBy: ["metadata ->> '${this.sortAttribut}'"]`;
        }


        if (data.asc) {
            this.sortOption = "sortBy_options: [ASC]";
        } else {
            this.sortOption = "sortBy_options: [DESC]";
        }

    }

    setLimit(limit) {
        this.limitIntern = parseInt(limit, 10);
        if (limit === null) {
            this.limit = "";
        } else {
            this.limit = `limitFetchingSize: ${limit},\n  `;
        }
    }

    setOffset(offset) {
        this.offsetIntern = parseInt(offset, 10);
        if (offset === null) {
            this.offset = "";
        } else {
            this.offset = `offset: ${offset},\n  `;
        }
    }


    generateAndGetGraphQlCode() {

        //dont change the formatting here, cause this has a direct change to the formatting in the graphql-inspection-window
        let query_header = `
   ${this.fileHashes}
   ${this.limit} ${this.offset} ${this.sortAttribut} ${this.sortOption}
   ${this.deleted}
   ${this.startDate} ${this.endDate} ${this.startDateUpdated} ${this.endDateUpdated}
   ${this.filetypes}
   ${this.options_options} ${this.options_attributes} ${this.options_values}
   ${this.filterOption} ${this.filterCustomString}
   ${this.attributes}

        `;

        if (query_header.trim() === "") {
            query_header = "";
        } else {
            query_header = `(
            ${query_header}
  )`
        }

        let query = `
query
{
  searchForFileMetadata
  ${query_header}
  {
    numberOfTotalFiles,
    numberOfReturnedFiles,
    files
    {
      id,
      crawl_id,
      dir_path,
      name,
      type,
      creation_time,
      access_time,
      modification_time,
      file_hash,
      deleted,
      metadata
      {
        name,
        value,
      }
    }
  }
}`;
//END dont do a change

        return query;
    }


}
