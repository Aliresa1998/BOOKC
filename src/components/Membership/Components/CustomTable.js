import React from "react";
import { Pagination, List, Avatar } from "antd";
import Pic1 from "../../../assets/img/imgo4.jpg";
import "./componentStyle.css";

const CustomTable = ({
  type,
  rows,
  columns,
  changeCurrentStateToShowMemberDetail,
  count,
  page,
  page_size,
  handleChangePage,
}) => {
  const handleChangePageLocal = (e) => {
    handleChangePage(e);
  };

  return (
    <React.Fragment>
      {"memberList" == type ? (
        <React.Fragment>
          <List
            bordered
            itemLayout="horizontal"
            dataSource={rows}
            renderItem={(item, index) => (
              <List.Item
                extra={
                  <a
                    className="view"
                    onClick={() => {
                      changeCurrentStateToShowMemberDetail(item);
                    }}
                  >
                    View
                  </a>
                }
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      src={item.profile_picture ? item.profile_picture : Pic1}
                    />
                  }
                  title={
                    <a
                      onClick={() => {
                        changeCurrentStateToShowMemberDetail(item);
                      }}
                    >
                      {item.first_name || item.last_name
                        ? item.first_name + " " + item.last_name
                        : item.customer_name
                        ? item.customer_name
                        : "-"}
                    </a>
                  }
                  description={
                    item.patient_plan && item.patient_plan.plan_name
                      ? item.patient_plan.plan_name
                      : "-"
                  }
                />
              </List.Item>
            )}
          />
        </React.Fragment>
      ) : (
        <React.Fragment></React.Fragment>
      )}

      <div className="paginationSubTable">
        <Pagination
          total={page_size}
          current={page}
          className="paginator"
          size="small"
          showSizeChanger={false}
          hideOnSinglePage={true}
          onChange={handleChangePageLocal}
        />
      </div>
    </React.Fragment>
  );
};
export default CustomTable;
