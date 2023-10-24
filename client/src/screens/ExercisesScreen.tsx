import { workoutFormActions } from "@/src/redux/workoutFormReducer";
import { RouteProp, useRoute } from "@react-navigation/native";
import axios from "axios";
import React, { FC, useEffect, useLayoutEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { Button, Searchbar, Text } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import ExerciseCard from "../components/ExerciseCard";
import routes, { RootStackParamList, RouteValues } from "../constants/routes";
import { theme } from "../constants/theme";
import { Exercise } from "../models/exerciseModel";
import { addExercises } from "../redux/exerciseReducer";
import { RootState } from "../redux/store";

const ExercisesScreen: FC<any> = ({ navigation }) => {
	const dispatch = useDispatch();
	const { params } = useRoute<RouteProp<RootStackParamList, "Exercises">>();

	const data = useSelector<RootState, { [key: string]: Exercise }>(
		(s) => s.exercise.value
	);
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		if (!Object.keys(data).length) {
			axios
				.get<{ [key: string]: Exercise }>(
					"http://192.168.1.2:8090/api/exercises"
				)
				.then((res) => dispatch(addExercises(res.data)));
		}
	}, []);

	const result = Object.values(data)?.filter((item) =>
		item.name.toLowerCase().includes(searchQuery.toLowerCase())
	);

	useLayoutEffect(() => {
		navigation.setOptions({
			headerTitle: params?.id ? "Choose exercises" : "Exercises",
			headerRight: () => (
				<Pressable
					style={{ marginRight: 12 }}
					onPress={() => navigateToRoute(routes.CREATE_EXERCISE)}
				>
					<Text variant="titleSmall">CREATE</Text>
				</Pressable>
			),
		});
	}, [navigation]);

	const onChangeSearch = (query) => setSearchQuery(query);

	const navigateToRoute = (route: RouteValues) => {
		navigation.navigate(route);
	};

	if (!Object.keys(data).length) return;

	return (
		<>
			<FlatList<Exercise>
				data={result}
				ListHeaderComponent={
					<View style={styles.searchContainer}>
						<Searchbar
							placeholder="Search"
							onChangeText={onChangeSearch}
							value={searchQuery}
							style={{ flex: 1 }}
						/>
					</View>
				}
				renderItem={({ item }) => (
					<ExerciseCard key={item.id} data={item} showCheckbox={!!params?.id} />
				)}
				contentContainerStyle={{ flexGrow: 1 }}
				ListEmptyComponent={
					<View style={styles.notFoundContainer}>
						<Text variant="titleLarge">"{searchQuery}" not found</Text>
						<Button mode="contained">Create Exercise</Button>
					</View>
				}
				stickyHeaderIndices={[0]}
			/>
			{!!params?.id && (
				<View style={styles.addContainer}>
					<Button style={styles.addButton} mode="contained">
						Add supersets
					</Button>
					<Button
						style={styles.addButton}
						mode="contained"
						onPress={() => {
							dispatch(workoutFormActions.addExercisesToWorkout(params.id)),
								navigation.goBack();
						}}
					>
						Add exercises
					</Button>
				</View>
			)}
		</>
	);
};

export default ExercisesScreen;

const styles = StyleSheet.create({
	searchContainer: {
		backgroundColor: theme.colors.background,
		flexDirection: "row",
		paddingBottom: 10,
		paddingHorizontal: 10,
	},
	notFoundContainer: {
		alignItems: "center",
		justifyContent: "center",
		gap: 10,
		flex: 1,
	},
	addContainer: {
		flexDirection: "row",
		backgroundColor: theme.colors.surfaceVariant,
		position: "absolute",
		bottom: 0,
		width: "100%",
		padding: 10,
		gap: 10,
	},
	addButton: {
		flex: 1,
	},
});
