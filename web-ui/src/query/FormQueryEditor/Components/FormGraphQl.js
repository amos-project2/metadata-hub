export class FormGraphQl {


    /**
     * you can set the members with the implicit setter-method
     */
    constructor() {

        this.limitIntern = -1;
        this.offsetIntern = -1;

        this.sortingIntern = {
            attribut: null,
            asc: true
        }


        this.id = "";

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

        if (limit === null) {
            this.limitIntern = -1;
            this.limit = "";
        } else {
            this.limitIntern = parseInt(limit, 10);
            this.limit = `limitFetchingSize: ${limit},\n  `;
        }
    }

    setOffset(offset) {

        if (offset === null) {
            this.offsetIntern = -1;
            this.offset = "";
        } else {
            this.offsetIntern = parseInt(offset, 10);
            this.offset = `offset: ${offset},\n  `;
        }
    }

    setId(id) {
        if (id === null) {
            this.id = "";
        } else {
            this.id = `file_ids: [${id}],\n  `;
        }
    }




    generateAndGetGraphQlCode() {

        //dont change the formatting here, cause this has a direct change to the formatting in the graphql-inspection-window
        let query_header = `
   ${this.fileHashes} ${this.id}
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
    error
    {
      message
      stack_trace
    },
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
