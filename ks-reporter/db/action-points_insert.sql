insert into pricing.event_points(event_name, event_category, event_subcategory, reward_type, reward_value) values('create', 'post', 'text', 'points', 15);
insert into pricing.event_points(event_name, event_category, event_subcategory, reward_type, reward_value) values('like', 'post', 'text', 'points', 8);
insert into pricing.event_points(event_name, event_category, event_subcategory, reward_type, reward_value) values('comment', 'post', 'text', 'points', 10);
insert into pricing.event_points(event_name, event_category, event_subcategory, reward_type, reward_value) values('share', 'post', 'text', 'points', 10);
insert into pricing.event_points(event_name, event_category, event_subcategory, reward_type, reward_value) values('delete-create', 'post', 'text', 'points', -15);
insert into pricing.event_points(event_name, event_category, reward_type, reward_value) values ('delete-like', 'post', 'points', -8);
insert into pricing.event_points(event_name, event_category, reward_type, reward_value) values ('delete-comment', 'post', 'points', -10);
insert into pricing.event_points(event_name, event_category, reward_type, reward_value) values ('delete-share', 'post', 'points', -10);


insert into pricing.event_points(event_name, event_category, event_subcategory, reward_type, reward_value) values('create', 'post', 'photo', 'points', 15);
insert into pricing.event_points(event_name, event_category, event_subcategory, reward_type, reward_value) values('like', 'post', 'photo', 'points', 8);
insert into pricing.event_points(event_name, event_category, event_subcategory, reward_type, reward_value) values('comment', 'post', 'photo', 'points', 10);
insert into pricing.event_points(event_name, event_category, event_subcategory, reward_type, reward_value) values('share', 'post', 'photo', 'points', 10);
insert into pricing.event_points(event_name, event_category, event_subcategory, reward_type, reward_value) values('delete-create', 'post', 'photo', 'points', -15);
insert into pricing.event_points(event_name, event_category, event_subcategory, reward_type, reward_value) values('view', 'post', 'photo', 'points', 5);

insert into pricing.event_points(event_name, event_category, event_subcategory, reward_type, reward_value) values('create', 'post', 'videoWithoutAds', 'points', 15);
insert into pricing.event_points(event_name, event_category, event_subcategory, reward_type, reward_value) values('like', 'post', 'videoWithoutAds', 'points', 8);
insert into pricing.event_points(event_name, event_category, event_subcategory, reward_type, reward_value) values('comment', 'post', 'videoWithoutAds', 'points', 10);
insert into pricing.event_points(event_name, event_category, event_subcategory, reward_type, reward_value) values('share', 'post', 'videoWithoutAds', 'points', 10);
insert into pricing.event_points(event_name, event_category, event_subcategory, reward_type, reward_value) values('delete-create', 'post', 'videoWithoutAds', 'points', -15);
insert into pricing.event_points(event_name, event_category, event_subcategory, reward_type, reward_value) values('view', 'post', 'videoWithoutAds', 'points', 5);

insert into pricing.event_points(event_name, event_category, event_subcategory, reward_type, reward_value) values('click', 'ad', 'video', 'points', 10);
insert into pricing.event_points(event_name, event_category, event_subcategory, reward_type, reward_value) values('sale', 'ad', 'video', 'percentage', 50);


insert into pricing.event_points(event_name, event_category,  reward_type, reward_value) values('follow', 'user', 'points', 5);
insert into pricing.event_points(event_name, event_category,  reward_type, reward_value) values('delete-follow', 'user',  'points', -5);
insert into pricing.event_points(event_name, event_category,  reward_type, reward_value) values('refer', 'user',  'points', 30);


insert into pricing.event_points(event_name, event_category, event_subcategory, reward_type, reward_value) values('like', 'ad', 'photo', 'points', 18);
insert into pricing.event_points(event_name, event_category, event_subcategory, reward_type, reward_value) values('comment', 'ad', 'photo', 'points', 20);
insert into pricing.event_points(event_name, event_category, event_subcategory, reward_type, reward_value) values('view', 'ad', 'photo', 'points', 10);
insert into pricing.event_points(event_name, event_category, event_subcategory, reward_type, reward_value) values('click', 'ad', 'photo', 'points', 5);
insert into pricing.event_points(event_name, event_category, event_subcategory, reward_type, reward_value) values('sale', 'ad', 'photo', 'percentage', 50);


insert into pricing.event_points(event_name, event_category, event_subcategory, reward_type, reward_value) values('like', 'ad', 'video', 'points', 18);
insert into pricing.event_points(event_name, event_category, event_subcategory, reward_type, reward_value) values('comment', 'ad', 'video', 'points', 20);
insert into pricing.event_points(event_name, event_category, event_subcategory, reward_type, reward_value) values('view-25', 'ad', 'video', 'points', 5);
insert into pricing.event_points(event_name, event_category, event_subcategory, reward_type, reward_value) values('view-50', 'ad', 'video', 'points', 10);
insert into pricing.event_points(event_name, event_category, event_subcategory, reward_type, reward_value) values('view-75', 'ad', 'video', 'points', 15);
insert into pricing.event_points(event_name, event_category, event_subcategory, reward_type, reward_value) values('view-100', 'ad', 'video', 'points', 20);

insert into pricing.event_points(event_name, event_category,  reward_type, reward_value) values('1', 'appusage', 'points', 1);
insert into pricing.event_points(event_name, event_category,  reward_type, reward_value) values('5', 'appusage', 'points', 5);
insert into pricing.event_points(event_name, event_category,  reward_type, reward_value) values('10', 'appusage', 'points', 10);
insert into pricing.event_points(event_name, event_category,  reward_type, reward_value) values('15', 'appusage', 'points', 15);
insert into pricing.event_points(event_name, event_category,  reward_type, reward_value) values('30', 'appusage', 'points', 20);
insert into pricing.event_points(event_name, event_category,  reward_type, reward_value) values('60', 'appusage', 'points', 25);
insert into pricing.event_points(event_name, event_category,  reward_type, reward_value) values('60above', 'appusage', 'points', 30);

insert into pricing.event_points(event_name, event_category,  reward_type, reward_value) values('follow', 'biz', 'points', 10);
insert into pricing.event_points(event_name, event_category,  reward_type, reward_value) values('refer', 'biz', 'percentage', 20);
insert into pricing.event_points(event_name, event_category,  reward_type, reward_value) values('like', 'biz', 'points', 8);
insert into pricing.event_points(event_name, event_category,  reward_type, reward_value) values('comment', 'biz', 'points', 10);
insert into pricing.event_points(event_name, event_category,  reward_type, reward_value) values('share', 'biz', 'points', 10);
insert into pricing.event_points(event_name, event_category,  reward_type, reward_value) values('delete-follow', 'biz', 'points', -10);
insert into pricing.event_points(event_name, event_category,  reward_type, reward_value) values('delete-like', 'biz', 'points', -8);
insert into pricing.event_points(event_name, event_category,  reward_type, reward_value) values('delete-comment', 'biz', 'points', -10);
insert into pricing.event_points(event_name, event_category,  reward_type, reward_value) values('delete-share', 'biz', 'points', -10);

insert into pricing.event_points(event_name, event_category,  reward_type, reward_value) values('sale', 'shop', 'percentage', 20);
insert into pricing.event_points(event_name, event_category,  reward_type, reward_value) values('refer', 'shop', 'percentage', 20);

