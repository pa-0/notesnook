import Notes from "../collections/notes";
import Notebooks from "../collections/notebooks";
import Trash from "../collections/trash";
import Tags from "../collections/tags";
import User from "../models/user";
import Sync from "./sync";

class Database {
  constructor(context) {
    this.context = context;
  }
  async init() {
    this.notebooks = new Notebooks(this.context);
    this.notes = new Notes(this.context);
    this.trash = new Trash(this.context);
    this.user = new User(this.context);
    this.tags = new Tags(this.context, "tags");
    this.colors = new Tags(this.context, "colors");
    await this.notes.init(this.notebooks, this.trash);
    await this.notebooks.init(this.notes, this.trash);
    await this.trash.init(this.notes, this.notebooks);
    await this.tags.init();
    await this.colors.init();
    this.syncer = new Sync(this);
  }

  sync() {
    return this.syncer.start();
  }
}

export default Database;
