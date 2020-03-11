import React, { useState, useEffect } from "react";
import Topic from "../components/topic";
import { Flex } from "rebass";
import ListContainer from "../components/list-container";
import * as Icon from "react-feather";
import { useStore as useNoteStore } from "../stores/note-store";
import { useStore as useNbStore } from "../stores/notebook-store";
import { showTopicDialog } from "../components/dialogs/topicdialog";

const TopicItem = props => (setSelectedContext, index, item) => (
  <Topic
    index={index}
    item={item}
    onClick={() => {
      let topic = item;
      setSelectedContext({
        type: "topic",
        value: topic.title,
        notebook: props.notebook
      });
      props.navigator.navigate("notes", {
        title: props.notebook.title,
        subtitle: topic.title
      });
    }}
  />
);

const Topics = props => {
  const setSelectedContext = useNoteStore(store => store.setSelectedContext);
  const setSelectedNotebookTopics = useNbStore(
    store => store.setSelectedNotebookTopics
  );
  const selectedNotebookTopics = useNbStore(
    store => store.selectedNotebookTopics
  );

  const [topics, setTopics] = useState([]);
  useEffect(() => {
    setTopics(selectedNotebookTopics);
  }, [selectedNotebookTopics]);

  useEffect(() => {
    setSelectedNotebookTopics(props.notebook.id);
  }, [setSelectedNotebookTopics, props.notebook.id]);

  return (
    <ListContainer
      itemsLength={topics.length}
      term={props.term}
      placeholder={Flex}
      searchPlaceholder="Search notebook topics"
      searchParams={{
        type: "topics",
        items: topics,
        item: TopicItem(props).bind(this, setSelectedContext)
      }}
      item={index => TopicItem(props)(setSelectedContext, index, topics[index])}
      button={{
        content: "Add more topics",
        onClick: async () => {
          await showTopicDialog(Icon.Book, "Topic", props.notebook.id);
        }
      }}
    />
  );
};

export default Topics;
